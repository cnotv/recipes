import type { MiddlewareHandler } from 'hono'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

/** The host name of a Host header or an Origin, port removed; undefined when it does not parse. */
const hostnameOf = (value: string | undefined, prefix = 'http://'): string | undefined => {
  try {
    return value ? new URL(`${prefix}${value}`).hostname.toLowerCase() : undefined
  } catch {
    return undefined
  }
}

const originAuthority = (origin: string): string | undefined => {
  try {
    return new URL(origin).host
  } catch {
    return undefined
  }
}

/** Rejects any request whose Host header is not listed, which stops DNS rebinding onto the loopback port. */
export const hostGuard =
  (allowedHosts: string[]): MiddlewareHandler =>
  async (context, next) => {
    const hostname = hostnameOf(context.req.header('host'))
    if (hostname === undefined || !allowedHosts.includes(hostname)) {
      return context.json({ error: 'Host not allowed' }, 403)
    }
    await next()
  }

/** Mutations must come from this origin and carry JSON, so a cross-site form cannot trigger them. */
export const sameOriginJson: MiddlewareHandler = async (context, next) => {
  if (SAFE_METHODS.includes(context.req.method)) return next()
  const origin = context.req.header('origin')
  if (origin !== undefined && originAuthority(origin) !== context.req.header('host')) {
    return context.json({ error: 'Cross-origin request refused' }, 403)
  }
  if (!context.req.header('content-type')?.toLowerCase().startsWith('application/json')) {
    return context.json({ error: 'Content-Type must be application/json' }, 415)
  }
  await next()
}
