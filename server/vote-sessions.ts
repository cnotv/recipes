import { randomBytes } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { z } from 'zod'
import { findPublishedRecipeBySlug, toRecipeSummary } from './recipes.ts'
import type { NewVoteSession, VoteOption, VoteSessionState, VoteSessionStatus, VoteViewer } from './vote-types.ts'

const RETENTION_DAYS = 30
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

const sessionRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  creator_id: z.string(),
  created_at: z.string(),
  ends_at: z.string(),
  closed_at: z.string().nullable(),
})
const optionRowSchema = z.object({ slug: z.string(), votes: z.number() })
const participantRowSchema = z.object({ name: z.string(), has_voted: z.number() })
const nameRowSchema = z.object({ name: z.string() })
const slugRowSchema = z.object({ slug: z.string() })
const idRowSchema = z.object({ id: z.number() })

export type VoteSessionRow = z.infer<typeof sessionRowSchema>

/** 128 random bits as base64url: unguessable, and unrelated to any other id. */
export const newToken = (): string => randomBytes(16).toString('base64url')

export const findVoteSession = (database: DatabaseSync, id: string): VoteSessionRow | undefined => {
  const row = database.prepare('SELECT * FROM vote_sessions WHERE id = ?').get(id)
  return row === undefined ? undefined : sessionRowSchema.parse(row)
}

export const statusOf = (session: VoteSessionRow, now: Date): VoteSessionStatus =>
  session.closed_at !== null ? 'closed' : session.ends_at <= now.toISOString() ? 'expired' : 'open'

/** Stores the session and its recipes; undefined when a slug is not a published recipe. */
export const createVoteSession = (
  database: DatabaseSync,
  { name, recipeSlugs, endsAt }: NewVoteSession,
  now: Date,
): { id: string; creatorId: string } | undefined => {
  const recipeIds = recipeSlugs.flatMap((slug) => {
    const row = database.prepare("SELECT id FROM recipes WHERE slug = ? AND status = 'published'").get(slug)
    return row === undefined ? [] : [idRowSchema.parse(row).id]
  })
  if (recipeIds.length !== recipeSlugs.length) return undefined
  const id = newToken()
  const creatorId = newToken()
  database.exec('BEGIN')
  database
    .prepare('INSERT INTO vote_sessions (id, name, creator_id, created_at, ends_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, creatorId, now.toISOString(), endsAt.toISOString())
  const insertRecipe = database.prepare('INSERT INTO vote_session_recipes (session_id, recipe_id, position) VALUES (?, ?, ?)')
  recipeIds.forEach((recipeId, position) => insertRecipe.run(id, recipeId, position))
  database.exec('COMMIT')
  return { id, creatorId }
}

export const addParticipant = (database: DatabaseSync, sessionId: string, name: string, now: Date): string => {
  const id = newToken()
  database.prepare('INSERT INTO participants (id, session_id, name, created_at) VALUES (?, ?, ?, ?)').run(id, sessionId, name, now.toISOString())
  return id
}

/** The participant's name when the id belongs to this session. */
export const findParticipantName = (database: DatabaseSync, sessionId: string, participantId: string): string | undefined => {
  const row = database.prepare('SELECT name FROM participants WHERE id = ? AND session_id = ?').get(participantId, sessionId)
  return row === undefined ? undefined : nameRowSchema.parse(row).name
}

export const renameParticipant = (database: DatabaseSync, sessionId: string, participantId: string, name: string): void => {
  database.prepare('UPDATE participants SET name = ? WHERE id = ? AND session_id = ?').run(name, participantId, sessionId)
}

/** Records or replaces the participant's vote; false when the recipe is not one of the session's. */
export const castVote = (database: DatabaseSync, sessionId: string, participantId: string, slug: string, now: Date): boolean =>
  Number(
    database
      .prepare(
        `INSERT INTO votes (session_id, participant_id, recipe_id, voted_at)
         SELECT ?, ?, vsr.recipe_id, ? FROM vote_session_recipes vsr JOIN recipes r ON r.id = vsr.recipe_id
         WHERE vsr.session_id = ? AND r.slug = ?
         ON CONFLICT (session_id, participant_id) DO UPDATE SET recipe_id = excluded.recipe_id, voted_at = excluded.voted_at`,
      )
      .run(sessionId, participantId, now.toISOString(), sessionId, slug).changes,
  ) > 0

export const closeVoteSession = (database: DatabaseSync, sessionId: string, now: Date): void => {
  database.prepare('UPDATE vote_sessions SET closed_at = ? WHERE id = ? AND closed_at IS NULL').run(now.toISOString(), sessionId)
}

const optionFor = (database: DatabaseSync, slug: string, votes: number, now: Date): VoteOption[] => {
  const recipe = findPublishedRecipeBySlug(database, slug)
  if (recipe === undefined) return []
  const summary = toRecipeSummary(recipe, now)
  return [
    {
      slug,
      titles: Object.fromEntries(Object.entries(recipe.languages).map(([language, translation]) => [language, translation.title])),
      cuisine: recipe.cuisine,
      minutes: summary.estimatedTime,
      imageUrl: summary.featuredImage,
      votes,
    },
  ]
}

const winnersOf = (options: VoteOption[], status: VoteSessionStatus): string[] => {
  const top = Math.max(0, ...options.map((option) => option.votes))
  return status === 'open' || top === 0 ? [] : options.filter((option) => option.votes === top).map((option) => option.slug)
}

export const buildVoteState = (database: DatabaseSync, session: VoteSessionRow, now: Date): VoteSessionState => {
  const options = z
    .array(optionRowSchema)
    .parse(
      database
        .prepare(
          `SELECT r.slug AS slug,
             (SELECT COUNT(*) FROM votes v WHERE v.session_id = vsr.session_id AND v.recipe_id = vsr.recipe_id) AS votes
           FROM vote_session_recipes vsr JOIN recipes r ON r.id = vsr.recipe_id
           WHERE vsr.session_id = ? ORDER BY vsr.position`,
        )
        .all(session.id),
    )
    .flatMap((row) => optionFor(database, row.slug, row.votes, now))
  const participants = z
    .array(participantRowSchema)
    .parse(
      database
        .prepare(
          `SELECT p.name AS name,
             EXISTS (SELECT 1 FROM votes v WHERE v.participant_id = p.id AND v.session_id = p.session_id) AS has_voted
           FROM participants p WHERE p.session_id = ? ORDER BY p.rowid`,
        )
        .all(session.id),
    )
    .map((row) => ({ name: row.name, hasVoted: row.has_voted === 1 }))
  const status = statusOf(session, now)
  return {
    id: session.id,
    name: session.name,
    endsAt: session.ends_at,
    status,
    options,
    participants,
    totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
    winnerSlugs: winnersOf(options, status),
  }
}

export const buildViewer = (
  database: DatabaseSync,
  session: VoteSessionRow,
  creatorCookie: string | undefined,
  participantCookie: string | undefined,
): VoteViewer => {
  const participantName = participantCookie === undefined ? undefined : findParticipantName(database, session.id, participantCookie)
  const votedRow =
    participantName === undefined || participantCookie === undefined
      ? undefined
      : database
          .prepare('SELECT r.slug AS slug FROM votes v JOIN recipes r ON r.id = v.recipe_id WHERE v.session_id = ? AND v.participant_id = ?')
          .get(session.id, participantCookie)
  return {
    isCreator: creatorCookie !== undefined && creatorCookie === session.creator_id,
    participantName: participantName ?? null,
    votedSlug: votedRow === undefined ? null : slugRowSchema.parse(votedRow).slug,
  }
}

/** Deletes sessions that ended, or were closed, more than 30 days ago; returns how many went. */
export const purgeOldVoteSessions = (database: DatabaseSync, now: Date): number => {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * MILLISECONDS_PER_DAY).toISOString()
  return Number(
    database.prepare('DELETE FROM vote_sessions WHERE MIN(ends_at, COALESCE(closed_at, ends_at)) < ?').run(cutoff).changes,
  )
}
