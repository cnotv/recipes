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
