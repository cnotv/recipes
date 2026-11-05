import type { DatabaseSync } from 'node:sqlite'
import type { RecipeDifficulty } from './types.ts'

export type ResolvedAddress = { address: string; family: number }

/** Resolves a host name to every address it points at. */
export type HostLookup = (hostname: string) => Promise<ResolvedAddress[]>

export type FetchedPage = { finalUrl: string; body: string }

export type PageFetcher = (url: string) => Promise<FetchedPage>

export type PageFetcherOptions = {
  lookup?: HostLookup
  allowAddress?: (address: string) => boolean
  allowAnyPort?: boolean
  maxBytes?: number
  timeoutMs?: number
  maxRedirects?: number
}

export type ModelPrompt = { system: string; user: string }

/** Sends one prompt to the language model and returns the raw text of its answer. */
export type ModelCall = (prompt: ModelPrompt) => Promise<string>

export type SourceLanguage = 'en' | 'de' | 'jp' | 'th'

/** A recipe read from a page, in the language of the page. */
export type ImportedRecipe = {
  title: string
  description?: string
  ingredients: string[]
  steps: string[]
  cuisine?: string
  difficulty: RecipeDifficulty
  coverImage?: string
}

export type SubmissionStatus = 'queued' | 'importing' | 'translating' | 'pending' | 'published' | 'rejected' | 'failed'

export type SubmissionRow = {
  id: string
  url: string
  normalizedUrl: string
  status: SubmissionStatus
  reason: string | null
  translated: boolean
  recipeId: number | null
}

/** Runs jobs one after another; `idle` settles when everything queued so far has finished. */
export type JobQueue = {
  enqueue: (job: () => Promise<void>) => void
  idle: () => Promise<void>
}

/** Everything the submission routes reach outside the process for, so tests can stub it. */
export type SubmissionServices = {
  fetchPage: PageFetcher
  /** Undefined when no OpenRouter key is configured. */
  callModel: ModelCall | undefined
  queue: JobQueue
  now: () => Date
  lookup: HostLookup
}

export type SubmissionContext = { database: DatabaseSync; services: SubmissionServices }
