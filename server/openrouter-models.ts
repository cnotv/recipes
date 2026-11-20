import { z } from 'zod'
import type { ModelOption } from './submission-types.ts'
import { userError } from './user-error.ts'

const ENDPOINT = 'https://openrouter.ai/api/v1/models'
const TIMEOUT_MS = 10_000

const modelListSchema = z.object({
  data: z.array(z.object({ id: z.string().min(1), name: z.string().optional() })),
})

/** Reads the public OpenRouter catalogue, free models first because they are the ones that cost nothing. */
export const createOpenRouterModelList =
  (fetchImpl: typeof fetch = fetch): (() => Promise<ModelOption[]>) =>
  async () => {
    const response = await fetchImpl(ENDPOINT, { signal: AbortSignal.timeout(TIMEOUT_MS) }).catch(() => {
      throw userError('The OpenRouter model list could not be reached')
    })
    if (!response.ok) throw userError(`The OpenRouter model list answered with status ${response.status}`)
    const parsed = modelListSchema.safeParse(await response.json().catch(() => undefined))
    if (!parsed.success) throw userError('The OpenRouter model list gave an unexpected answer')
    return parsed.data.data
      .map((model) => ({ id: model.id, name: model.name ?? model.id }))
      .sort(
        (first, second) =>
          Number(second.id.endsWith(':free')) - Number(first.id.endsWith(':free')) || first.name.localeCompare(second.name),
      )
  }
