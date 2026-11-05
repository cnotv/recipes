import { z } from 'zod'
import type { ModelCall } from './submission-types.ts'
import { userError } from './user-error.ts'

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const TIMEOUT_MS = 120_000

const completionSchema = z.object({ choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1) })

type OpenRouterOptions = { apiKey: string; model: string; fetchImpl?: typeof fetch }

/**
 * A model call over plain fetch. The key goes into one header and nowhere else: failures name the
 * status or the step, never the response body or the underlying error, which could echo the key.
 */
export const createOpenRouterCall =
  ({ apiKey, model, fetchImpl = fetch }: OpenRouterOptions): ModelCall =>
  async ({ system, user }) => {
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch(() => {
      throw userError('The language model could not be reached')
    })
    if (!response.ok) throw userError(`The language model answered with status ${response.status}`)
    const completion = completionSchema.safeParse(await response.json().catch(() => undefined))
    if (!completion.success) throw userError('The language model gave an unexpected answer')
    return completion.data.choices[0].message.content
  }
