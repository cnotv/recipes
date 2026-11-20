import { describe, expect, it } from 'vitest'
import { createOpenRouterModelList } from './openrouter-models.ts'

const reply =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    new Response(JSON.stringify(body), { status })

describe('createOpenRouterModelList', () => {
  it('puts free models first and falls back to the id when a model has no name', async () => {
    const list = createOpenRouterModelList(
      reply({
        data: [
          { id: 'paid/model', name: 'Paid Model' },
          { id: 'free/model:free' },
        ],
      }),
    )
    expect(await list()).toEqual([
      { id: 'free/model:free', name: 'free/model:free' },
      { id: 'paid/model', name: 'Paid Model' },
    ])
  })

  it('fails with a readable reason instead of the response body', async () => {
    const unexpected = await createOpenRouterModelList(reply({ unexpected: true }))().catch((error: unknown) => error)
    expect(String(unexpected)).toContain('unexpected answer')
    const status = await createOpenRouterModelList(reply({ secret: 'no' }, 503))().catch((error: unknown) => error)
    expect(String(status)).toContain('503')
    expect(String(status)).not.toContain('secret')
  })

  it('fails when the network does', async () => {
    const failure = await createOpenRouterModelList(async () => {
      throw new Error('boom')
    })().catch((error: unknown) => error)
    expect(String(failure)).toContain('could not be reached')
  })
})
