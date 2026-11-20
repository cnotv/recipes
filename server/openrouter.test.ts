import { describe, expect, it } from 'vitest'
import { createOpenRouterCall } from './openrouter.ts'

const KEY = 'sk-or-secret-key-123'

const reply = (body: unknown, status = 200): typeof fetch => async () => new Response(JSON.stringify(body), { status })

describe('createOpenRouterCall', () => {
  it('posts a JSON mode chat completion with the key in the Authorization header only', async () => {
    const seen: { url: string; init: RequestInit }[] = []
    const call = createOpenRouterCall({
      apiKey: KEY,
      model: 'a/b:free',
      fetchImpl: async (url, init) => {
        seen.push({ url: String(url), init: init ?? {} })
        return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }))
      },
    })
    expect(await call({ system: 'sys', user: 'usr' })).toBe('{"ok":true}')
    expect(seen[0].url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(new Headers(seen[0].init.headers).get('authorization')).toBe(`Bearer ${KEY}`)
    expect(String(seen[0].init.body)).not.toContain(KEY)
    expect(JSON.parse(String(seen[0].init.body))).toMatchObject({
      model: 'a/b:free',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'usr' },
      ],
    })
  })

  it('fails with a reason that names the status and never the key', async () => {
    const call = createOpenRouterCall({ apiKey: KEY, model: 'm', fetchImpl: reply({ error: { message: `bad key ${KEY}` } }, 401) })
    const failure = await call({ system: 's', user: 'u' }).catch((error: unknown) => error)
    expect(String(failure)).toContain('401')
    expect(String(failure)).not.toContain(KEY)
  })

  it('fails on a body that is not a chat completion', async () => {
    const call = createOpenRouterCall({ apiKey: KEY, model: 'm', fetchImpl: reply({ unexpected: true }) })
    await expect(call({ system: 's', user: 'u' })).rejects.toThrow('unexpected answer')
  })

  it('fails when the network does, without the key', async () => {
    const call = createOpenRouterCall({
      apiKey: KEY,
      model: 'm',
      fetchImpl: async () => {
        throw new Error(`connect failed for ${KEY}`)
      },
    })
    const failure = await call({ system: 's', user: 'u' }).catch((error: unknown) => error)
    expect(String(failure)).not.toContain(KEY)
  })

  it('reads a model getter on every call, so a saved model applies without a restart', async () => {
    const used: string[] = []
    let current = 'first/model:free'
    const call = createOpenRouterCall({
      apiKey: KEY,
      model: () => current,
      fetchImpl: async (_url, init) => {
        used.push(JSON.parse(String(init?.body)).model)
        return new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }))
      },
    })
    await call({ system: 's', user: 'u' })
    current = 'second/model:free'
    await call({ system: 's', user: 'u' })
    expect(used).toEqual(['first/model:free', 'second/model:free'])
  })
})
