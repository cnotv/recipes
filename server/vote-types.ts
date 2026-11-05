export type VoteSessionStatus = 'open' | 'closed' | 'expired'

export type VoteOption = {
  slug: string
  titles: Record<string, string>
  cuisine: string | null
  minutes: number
  imageUrl: string | null
  votes: number
}

export type VoteParticipant = { name: string; hasVoted: boolean }

/** What every viewer of a session sees, and what the event stream carries. */
export type VoteSessionState = {
  id: string
  name: string
  endsAt: string
  status: VoteSessionStatus
  options: VoteOption[]
  participants: VoteParticipant[]
  totalVotes: number
  winnerSlugs: string[]
}

/** What one browser knows about itself, read from its cookies. */
export type VoteViewer = { isCreator: boolean; participantName: string | null; votedSlug: string | null }

export type VoteSessionResponse = VoteSessionState & { viewer: VoteViewer }

export type NewVoteSession = { name: string; recipeSlugs: string[]; endsAt: Date }
