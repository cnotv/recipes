import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { assertPublicUrl, createImageFetcher, createPageFetcher, isPublicAddress } from './safe-fetch.ts'
import type { HostLookup } from './submission-types.ts'

const lookupTo =
  (...addresses: string[]): HostLookup =>
  async () =>
    addresses.map((address) => ({ address, family: address.includes(':') ? 6 : 4 }))

describe('isPublicAddress', () => {
  it.each([
    '127.0.0.1',
    '127.9.9.9',
    '10.0.0.1',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '255.255.255.255',
    '::1',
    '::',
    'fe80::1',
    'fd00::1',
    'fc00::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '::ffff:169.254.169.254',
    'fd00:ec2::254',
    '64:ff9b::7f00:1',
    'not an address',
  ])('refuses %s', (address) => {
    expect(isPublicAddress(address)).toBe(false)
  })

  it.each(['93.184.216.34', '8.8.8.8', '172.32.0.1', '2606:2800:220:1:248:1893:25c8:1946'])('allows %s', (address) => {
    expect(isPublicAddress(address)).toBe(true)
  })
})

describe('assertPublicUrl', () => {
  const publicLookup = lookupTo('93.184.216.34')

  it('returns the parsed URL for a public http or https address', async () => {
    expect((await assertPublicUrl('https://example.com/a?b=1', publicLookup)).hostname).toBe('example.com')
    expect((await assertPublicUrl('http://example.com', publicLookup)).protocol).toBe('http:')
  })

  it.each([
    'file:///etc/passwd',
    'ftp://example.com/x',
    'gopher://example.com',
    'javascript:alert(1)',
    'data:text/html,hi',
    'https://user:pass@example.com/',
    'https://example.com:22/',
    'https://example.com:6379/',
    'not a url',
    'http://localhost/',
    'http://foo.localhost/',
    'http://127.0.0.1/',
    'http://127.1/',
    'http://2130706433/',
    'http://0x7f000001/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://[::ffff:127.0.0.1]/',
    'http://[fd00:ec2::254]/',
    'http://10.1.2.3/',
    'http://192.168.0.10/',
    'http://metadata.google.internal/',
  ])('refuses %s', async (url) => {
    await expect(assertPublicUrl(url, publicLookup)).rejects.toThrow()
  })

  it('refuses a name that resolves to a private address', async () => {
    await expect(assertPublicUrl('https://rebind.example/', lookupTo('127.0.0.1'))).rejects.toThrow('not allowed')
  })

  it('refuses a name when any one of its addresses is private', async () => {
    await expect(assertPublicUrl('https://mixed.example/', lookupTo('93.184.216.34', '10.0.0.5'))).rejects.toThrow('not allowed')
  })

  it('refuses a name that does not resolve', async () => {
    await expect(assertPublicUrl('https://gone.example/', async () => [])).rejects.toThrow('could not be found')
  })
})

describe('createPageFetcher against a local server', () => {
  const pages: Record<string, { status: number; headers?: Record<string, string>; body?: string; delayMs?: number }> = {
    '/ok': { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' }, body: '<p>hello</p>' },
    '/to-ok': { status: 302, headers: { location: '/ok' } },
    '/to-metadata': { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data/' } },
    '/to-file': { status: 302, headers: { location: 'file:///etc/passwd' } },
    '/loop': { status: 302, headers: { location: '/loop' } },
    '/big': { status: 200, headers: { 'content-type': 'text/html' }, body: 'x'.repeat(2000) },
    '/slow': { status: 200, headers: { 'content-type': 'text/html' }, body: 'late', delayMs: 400 },
    '/binary': { status: 200, headers: { 'content-type': 'image/png' }, body: 'png' },
    '/missing': { status: 404, body: 'no' },
    '/forbidden': { status: 403, body: 'no' },
    '/error': { status: 500, body: 'no' },
  }
  const state: { server?: Server; origin: string } = { origin: '' }

  beforeAll(async () => {
    state.server = createServer((request, response) => {
      const page = pages[request.url ?? ''] ?? { status: 404 }
      setTimeout(() => {
        response.writeHead(page.status, page.headers)
        response.end(page.body)
      }, page.delayMs ?? 0)
    })
    await new Promise<void>((resolve) => state.server?.listen(0, '127.0.0.1', resolve))
    state.origin = `http://127.0.0.1:${(state.server.address() as AddressInfo).port}`
  })
  afterAll(() => state.server?.close())

  const onlyLoopback = (address: string) => address === '127.0.0.1' || address === '::1'
  const fetcher = (options: Parameters<typeof createPageFetcher>[0] = {}) =>
    createPageFetcher({ allowAddress: onlyLoopback, allowAnyPort: true, ...options })

  it('refuses a loopback server with the default rules', async () => {
    await expect(createPageFetcher({ allowAnyPort: true })(`${state.origin}/ok`)).rejects.toThrow('not allowed')
  })

  it('returns the body and the final address, following a redirect', async () => {
    const page = await fetcher()(`${state.origin}/to-ok`)
    expect(page.body).toBe('<p>hello</p>')
    expect(page.finalUrl).toBe(`${state.origin}/ok`)
  })

  it('re-checks every redirect target', async () => {
    await expect(fetcher()(`${state.origin}/to-metadata`)).rejects.toThrow('not allowed')
    await expect(fetcher()(`${state.origin}/to-file`)).rejects.toThrow()
  })

  it('stops a redirect loop', async () => {
    await expect(fetcher()(`${state.origin}/loop`)).rejects.toThrow('redirect')
  })

  it('refuses a body larger than the cap', async () => {
    await expect(fetcher({ maxBytes: 1000 })(`${state.origin}/big`)).rejects.toThrow('too large')
  })

  it('gives up after the time limit', async () => {
    await expect(fetcher({ timeoutMs: 100 })(`${state.origin}/slow`)).rejects.toThrow('too long')
  })

  it('refuses content that is not a web page, and error statuses', async () => {
    await expect(fetcher()(`${state.origin}/binary`)).rejects.toThrow('not a web page')
    await expect(fetcher()(`${state.origin}/missing`)).rejects.toThrow('404')
  })
})

describe('createImageFetcher', () => {
  const state: { server?: Server; origin: string } = { origin: '' }
  const answers: Record<string, { status: number; type: string }> = {
    '/photo': { status: 200, type: 'image/png' },
    '/page': { status: 200, type: 'text/html' },
    '/gone': { status: 404, type: 'text/html' },
    '/refused': { status: 403, type: 'text/html' },
    '/broken': { status: 500, type: 'text/html' },
  }
  beforeAll(async () => {
    state.server = createServer((request, response) => {
      const answer = answers[request.url ?? ''] ?? { status: 404, type: 'text/plain' }
      response.writeHead(answer.status, { 'content-type': answer.type })
      response.end('bytes')
    })
    await new Promise<void>((resolve) => state.server?.listen(0, '127.0.0.1', resolve))
    state.origin = `http://127.0.0.1:${(state.server.address() as AddressInfo).port}`
  })
  afterAll(() => state.server?.close())

  const fetchImage = createImageFetcher({ allowAddress: (address) => address === '127.0.0.1', allowAnyPort: true })

  it('returns the bytes of a picture', async () => {
    expect((await fetchImage(`${state.origin}/photo`))?.toString()).toBe('bytes')
  })

  it('answers undefined when the source no longer has the picture or refuses to share it', async () => {
    expect(await fetchImage(`${state.origin}/gone`)).toBeUndefined()
    expect(await fetchImage(`${state.origin}/refused`)).toBeUndefined()
  })

  it('throws on a server error or a page, so the caller may retry or look again', async () => {
    await expect(fetchImage(`${state.origin}/broken`)).rejects.toThrow('500')
    await expect(fetchImage(`${state.origin}/page`)).rejects.toThrow('not a picture')
  })

  it('refuses private addresses by default', async () => {
    await expect(createImageFetcher({ allowAnyPort: true })(`${state.origin}/photo`)).rejects.toThrow('not allowed')
  })
})

describe('connect time check', () => {
  it('refuses a name that answers with a public address for the check and a private one for the connection', async () => {
    const answers = [[{ address: '93.184.216.34', family: 4 }], [{ address: '127.0.0.1', family: 4 }]]
    const state = { calls: 0 }
    const lookup: HostLookup = async () => answers[Math.min(state.calls++, 1)]
    await expect(createPageFetcher({ lookup })('http://rebind.example/')).rejects.toThrow('not allowed')
    expect(state.calls).toBe(2)
  })
})
