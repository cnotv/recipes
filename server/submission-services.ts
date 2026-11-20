import { lookup as dnsLookup } from 'node:dns/promises'
import type { DatabaseSync } from 'node:sqlite'
import { createOpenRouterCall } from './openrouter.ts'
import { createOpenRouterModelList } from './openrouter-models.ts'
import { createImageFetcher, createPageFetcher } from './safe-fetch.ts'
import { OPENROUTER_MODEL_SETTING, readSetting } from './settings.ts'
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

export const createDefaultServices = (config: ServerConfig, database: DatabaseSync): SubmissionServices => {
  const lookup: SubmissionServices['lookup'] = (hostname) => dnsLookup(hostname, { all: true, verbatim: true })
  return {
    fetchPage: createPageFetcher({ lookup }),
    media: { directory: config.mediaDirectory, fetchImage: createImageFetcher({ lookup }) },
    callModel:
      config.openRouterApiKey === undefined
        ? undefined
        : createOpenRouterCall({
            apiKey: config.openRouterApiKey,
            // Read per call, so a model saved in the admin panel applies without a restart.
            model: () => readSetting(database, OPENROUTER_MODEL_SETTING) ?? config.openRouterModel,
          }),
    listModels: createOpenRouterModelList(),
    queue: createJobQueue(),
    now: () => new Date(),
    lookup,
  }
}
