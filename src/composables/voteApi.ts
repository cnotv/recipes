import { z } from 'zod'
import type { VoteSessionResponse, VoteSessionState } from '../../server/vote-types'

/** The Netlify preview build has no server, so there is nothing for the vote screens to call. */
export const voteAvailable = import.meta.env.VITE_DATA_SOURCE !== 'static'

const stateShape = {
  id: z.string(),
  name: z.string(),
  endsAt: z.string(),
  status: z.enum(['open', 'closed', 'expired']),
  options: z.array(
    z.object({
      slug: z.string(),
      titles: z.record(z.string(), z.string()),
      cuisine: z.string().nullable(),
      minutes: z.number(),
      imageUrl: z.string().nullable(),
      votes: z.number(),
    }),
  ),
  participants: z.array(z.object({ name: z.string(), hasVoted: z.boolean() })),
  totalVotes: z.number(),
  winnerSlugs: z.array(z.string()),
}

/** Validates what the event stream sends; the types come from the server so the two cannot drift. */
export const voteStateSchema: z.ZodType<VoteSessionState> = z.object(stateShape)

const voteSessionResponseSchema: z.ZodType<VoteSessionResponse> = z.object({
  ...stateShape,
  viewer: z.object({ isCreator: z.boolean(), participantName: z.string().nullable(), votedSlug: z.string().nullable() }),
})

const sendJson = (path: string, method: 'POST' | 'PUT', body: unknown): Promise<Response> =>
  fetch(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

const requireOk = async (response: Response): Promise<Response> => {
  if (!response.ok) throw new Error(`Request failed with ${response.status}`)
  return response
}

const sessionPath = (id: string): string => `/api/vote-sessions/${encodeURIComponent(id)}`

export const createVote = async (input: { name: string; recipeSlugs: string[]; endsAt: string }): Promise<string> => {
  const response = await requireOk(await sendJson('/api/vote-sessions', 'POST', input))
  return z.object({ id: z.string() }).parse(await response.json()).id
}

/** The session as this browser sees it, or undefined when the id is unknown. */
export const fetchVote = async (id: string): Promise<VoteSessionResponse | undefined> => {
  const response = await fetch(sessionPath(id))
  if (response.status === 404) return undefined
  return voteSessionResponseSchema.parse(await (await requireOk(response)).json())
}

export const joinVote = async (id: string, name: string): Promise<void> => {
  await requireOk(await sendJson(`${sessionPath(id)}/join`, 'POST', { name }))
}

export const castVote = async (id: string, recipeSlug: string): Promise<void> => {
  await requireOk(await sendJson(`${sessionPath(id)}/vote`, 'PUT', { recipeSlug }))
}

export const closeVote = async (id: string): Promise<void> => {
  await requireOk(await sendJson(`${sessionPath(id)}/close`, 'POST', {}))
}

export const eventsPath = (id: string): string => `${sessionPath(id)}/events`
