import { lookup as dnsLookup } from 'node:dns/promises'
import { createOpenRouterCall } from './openrouter.ts'
import { createImageFetcher, createPageFetcher } from './safe-fetch.ts'
import type { JobQueue, SubmissionServices } from './submission-types.ts'
import type { ServerConfig } from './types.ts'

/**
 * One worker, jobs in arrival order, so the free model sees one request at a time.
 * ponytail: in memory, so waiting jobs are lost on a restart (the routes re-queue unfinished rows at startup); a table with a poller if import volume ever needs more than one worker.
 */
export const createJobQueue = (): JobQueue => {
  const state = { tail: Promise.resolve() }
  return {
    enqueue: (job) => {
      state.tail = state.tail.then(job).catch(() => undefined)
    },
    idle: () => state.tail,
  }
}

export const createDefaultServices = (config: ServerConfig): SubmissionServices => {
  const lookup: SubmissionServices['lookup'] = (hostname) => dnsLookup(hostname, { all: true, verbatim: true })
  return {
    fetchPage: createPageFetcher({ lookup }),
    media: { directory: config.mediaDirectory, fetchImage: createImageFetcher({ lookup }) },
    callModel:
      config.openRouterApiKey === undefined
        ? undefined
        : createOpenRouterCall({ apiKey: config.openRouterApiKey, model: config.openRouterModel }),
    queue: createJobQueue(),
    now: () => new Date(),
    lookup,
  }
}
