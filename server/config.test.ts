import { describe, expect, it } from 'vitest'
import { loadConfig } from './config.ts'

describe('loadConfig', () => {
  it('defaults to loopback names and a loopback bind', () => {
    expect(loadConfig({})).toMatchObject({
      host: '127.0.0.1',
      port: 4330,
      allowedHosts: ['localhost', '127.0.0.1', '[::1]'],
      siteUrl: 'http://localhost:4330',
    })
  })

  it('reads the allowed hosts as a trimmed, lowercase list', () => {
    expect(loadConfig({ RECIPES_ALLOWED_HOSTS: ' Recipes.Example , localhost ' }).allowedHosts).toEqual([
      'recipes.example',
      'localhost',
    ])
  })

  it('refuses a bad port', () => {
    expect(() => loadConfig({ RECIPES_PORT: 'abc' })).toThrow()
  })
})

describe('loadConfig submission settings', () => {
  it('has no key and no admin token by default, and a free default model', () => {
    const config = loadConfig({})
    expect(config.openRouterApiKey).toBeUndefined()
    expect(config.adminToken).toBeUndefined()
    expect(config.openRouterModel).toMatch(/:free$/)
    expect(config.trustProxy).toBe(false)
  })

  it('reads the key, model, admin token and proxy trust', () => {
    expect(
      loadConfig({
        OPENROUTER_API_KEY: 'k',
        OPENROUTER_MODEL: 'a/b:free',
        RECIPES_ADMIN_TOKEN: 'x'.repeat(16),
        RECIPES_TRUST_PROXY: 'true',
      }),
    ).toMatchObject({ openRouterApiKey: 'k', openRouterModel: 'a/b:free', adminToken: 'x'.repeat(16), trustProxy: true })
  })

  it('refuses a short admin token', () => {
    expect(() => loadConfig({ RECIPES_ADMIN_TOKEN: 'short' })).toThrow()
  })
})
