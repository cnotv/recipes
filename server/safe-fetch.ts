import { lookup as dnsLookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import { BlockList, isIP, type LookupFunction } from 'node:net'
import type { ResolvedAddress, FetchedPage, HostLookup, PageFetcher, PageFetcherOptions } from './submission-types.ts'
import { userError } from './user-error.ts'

const MAX_BYTES = 5 * 1024 * 1024
const TIMEOUT_MS = 10_000
const MAX_REDIRECTS = 5
const WEB_PORTS = ['', '80', '443']
const REDIRECT_STATUSES = [301, 302, 303, 307, 308]

const blockedRanges: [string, number, 'ipv4' | 'ipv6'][] = [
  ['0.0.0.0', 8, 'ipv4'],
  ['10.0.0.0', 8, 'ipv4'],
  ['100.64.0.0', 10, 'ipv4'],
  ['127.0.0.0', 8, 'ipv4'],
  ['169.254.0.0', 16, 'ipv4'],
  ['172.16.0.0', 12, 'ipv4'],
  ['192.0.0.0', 24, 'ipv4'],
  ['192.0.2.0', 24, 'ipv4'],
  ['192.168.0.0', 16, 'ipv4'],
  ['198.18.0.0', 15, 'ipv4'],
  ['198.51.100.0', 24, 'ipv4'],
  ['203.0.113.0', 24, 'ipv4'],
  ['224.0.0.0', 4, 'ipv4'],
  ['240.0.0.0', 4, 'ipv4'],
  ['::', 128, 'ipv6'],
  ['::1', 128, 'ipv6'],
  // IPv4 mapped, NAT64, Teredo and 6to4 addresses can all wrap a private IPv4 address.
  ['::ffff:0:0', 96, 'ipv6'],
  ['64:ff9b::', 96, 'ipv6'],
  ['2001::', 32, 'ipv6'],
  ['2002::', 16, 'ipv6'],
  ['2001:db8::', 32, 'ipv6'],
  ['fc00::', 7, 'ipv6'],
  ['fe80::', 10, 'ipv6'],
  ['ff00::', 8, 'ipv6'],
]

// Two lists, because an IPv6 rule such as ::ffff:0:0/96 would otherwise also match plain IPv4 addresses.
const blockListFor = (wanted: 'ipv4' | 'ipv6'): BlockList =>
  blockedRanges
    .filter(([, , family]) => family === wanted)
    .reduce((list, [network, prefix, family]) => {
      list.addSubnet(network, prefix, family)
      return list
    }, new BlockList())

const blockLists = { ipv4: blockListFor('ipv4'), ipv6: blockListFor('ipv6') }

const denied = () => userError('That address is not allowed')

/** True only for a global unicast address: not private, loopback, link local (cloud metadata included) or reserved. */
export const isPublicAddress = (address: string): boolean => {
  const family = isIP(address)
  if (family === 0) return false
  const name = family === 4 ? 'ipv4' : 'ipv6'
  return !blockLists[name].check(address, name)
}

const defaultLookup: HostLookup = (hostname) => dnsLookup(hostname, { all: true, verbatim: true })

const bareHostname = (hostname: string): string => hostname.replace(/^\[|\]$/g, '').toLowerCase()

const isInternalName = (hostname: string): boolean =>
  hostname === 'localhost' || ['.localhost', '.local', '.internal', '.localdomain'].some((suffix) => hostname.endsWith(suffix))

const parseWebUrl = (value: string, allowAnyPort: boolean): URL => {
  const url = URL.canParse(value) ? new URL(value) : undefined
  if (url === undefined) throw userError('That is not a valid link')
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw userError('Only http and https links are allowed')
  if (url.username !== '' || url.password !== '') throw userError('Links with a user name or password are not allowed')
  if (!allowAnyPort && !WEB_PORTS.includes(url.port)) throw userError('Only the standard web ports are allowed')
  return url
}

/**
 * Validates a link before any request: web scheme, no credentials, standard port, and every address
 * the host name resolves to must be public.
 */
export const assertPublicUrl = async (
  value: string,
  lookup: HostLookup = defaultLookup,
  allowAddress: (address: string) => boolean = isPublicAddress,
  allowAnyPort = false,
): Promise<URL> => {
  const url = parseWebUrl(value, allowAnyPort)
  const hostname = bareHostname(url.hostname)
  if (isIP(hostname) !== 0) {
    if (!allowAddress(hostname)) throw denied()
    return url
  }
  if (isInternalName(hostname)) throw denied()
  const addresses = await lookup(hostname).catch(() => [])
  if (addresses.length === 0) throw userError('That site could not be found')
  if (!addresses.every(({ address }) => allowAddress(address))) throw denied()
  return url
}

type Hop = { kind: 'page'; body: string } | { kind: 'redirect'; location: string }

/** Resolves at connect time and refuses a private answer, so a name that changes its address between check and connect still fails. */
const guardedLookup =
  (lookup: HostLookup, allowAddress: (address: string) => boolean): LookupFunction =>
  (hostname, options, callback) => {
    lookup(bareHostname(hostname)).then(
      (addresses: ResolvedAddress[]) => {
        if (addresses.length === 0 || !addresses.every(({ address }) => allowAddress(address))) return callback(denied(), [])
        return options.all ? callback(null, addresses) : callback(null, addresses[0].address, addresses[0].family)
      },
      () => callback(userError('That site could not be found'), []),
    )
  }

const requestOnce = (url: URL, settings: Required<PageFetcherOptions>, signal: AbortSignal): Promise<Hop> =>
  new Promise<Hop>((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http
    const request = client.request(
      url,
      {
        signal,
        lookup: guardedLookup(settings.lookup, settings.allowAddress),
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; RecipesImporter/1.0)',
          accept: 'text/html,application/xhtml+xml',
          'accept-encoding': 'identity',
        },
      },
      (response) => {
        const status = response.statusCode ?? 0
        const location = response.headers.location
        if (REDIRECT_STATUSES.includes(status) && location !== undefined) {
          response.resume()
          return resolve({ kind: 'redirect', location })
        }
        if (status < 200 || status >= 300) {
          response.resume()
          return reject(userError(`The site answered with status ${status}`))
        }
        if (!/html|xml|text\/plain/i.test(response.headers['content-type'] ?? '')) {
          response.resume()
          return reject(userError('That link is not a web page'))
        }
        if (Number(response.headers['content-length'] ?? 0) > settings.maxBytes) {
          response.destroy()
          return reject(userError('That page is too large'))
        }
        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => {
          chunks.push(chunk)
          if (chunks.reduce((total, part) => total + part.length, 0) > settings.maxBytes) {
            response.destroy()
            reject(userError('That page is too large'))
          }
        })
        response.on('end', () => resolve({ kind: 'page', body: Buffer.concat(chunks).toString('utf8') }))
        response.on('error', reject)
      },
    )
    request.on('error', reject)
    request.end()
  })

const followRedirects = async (
  value: string,
  settings: Required<PageFetcherOptions>,
  signal: AbortSignal,
  redirectsLeft: number,
): Promise<FetchedPage> => {
  const url = await assertPublicUrl(value, settings.lookup, settings.allowAddress, settings.allowAnyPort)
  const hop = await requestOnce(url, settings, signal)
  if (hop.kind === 'page') return { finalUrl: url.href, body: hop.body }
  if (redirectsLeft <= 0) throw userError('The link redirects too many times')
  return followRedirects(new URL(hop.location, url).href, settings, signal, redirectsLeft - 1)
}

/** Fetches a page over a validated connection: public addresses only, each redirect re-checked, capped size and time. */
export const createPageFetcher = (options: PageFetcherOptions = {}): PageFetcher => {
  const settings: Required<PageFetcherOptions> = {
    lookup: options.lookup ?? defaultLookup,
    allowAddress: options.allowAddress ?? isPublicAddress,
    allowAnyPort: options.allowAnyPort ?? false,
    maxBytes: options.maxBytes ?? MAX_BYTES,
    timeoutMs: options.timeoutMs ?? TIMEOUT_MS,
    maxRedirects: options.maxRedirects ?? MAX_REDIRECTS,
  }
  return async (value) => {
    const signal = AbortSignal.timeout(settings.timeoutMs)
    return followRedirects(value, settings, signal, settings.maxRedirects).catch((error: unknown) => {
      throw signal.aborted ? userError('The page took too long to load') : error
    })
  }
}
