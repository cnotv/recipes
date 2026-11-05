import { DEFAULT_DESCRIPTION, PAGE_COPY, SITE_NAMES } from './seo-pages.ts'
import type { HeadModel, RecipeSeoInput, RouteKind, SeoLanguage, StaticPageKey } from './seo-types.ts'

export const HEAD_MARKER = '<!--head-->'
const LANGUAGES: SeoLanguage[] = ['en', 'de', 'jp', 'th']
const LOCALES: Record<SeoLanguage, string> = { en: 'en_US', de: 'de_DE', jp: 'ja_JP', th: 'th_TH' }
const STATIC_PATHS: Record<StaticPageKey, string> = {
  home: '/',
  voteNew: '/vote/new',
  submit: '/submit',
  impressum: '/impressum',
  datenschutz: '/datenschutz',
}
// The legal pages exist in German and English only; other interface languages read the English text.
const LEGAL_PAGES: StaticPageKey[] = ['impressum', 'datenschutz']
const DESCRIPTION_LIMIT = 160

export const isSeoLanguage = (value: unknown): value is SeoLanguage => LANGUAGES.some((language) => language === value)

/** The value of the `lang` attribute: the app says `jp` where HTML says `ja`. */
export const htmlLang = (language: SeoLanguage): string => (language === 'jp' ? 'ja' : language)

export const legalLanguage = (language: SeoLanguage): 'en' | 'de' => (language === 'de' ? 'de' : 'en')

export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`)

const absolute = (siteUrl: string, address: string): string => (address.startsWith('/') ? `${siteUrl}${address}` : address)

const withLanguage = (url: string, language: SeoLanguage): string => (language === 'en' ? url : `${url}?lang=${language}`)

const shorten = (text: string): string => {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= DESCRIPTION_LIMIT ? clean : `${clean.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`
}

const defaultImage = (siteUrl: string): string => `${siteUrl}/og-image.png`

const websiteJsonLd = (siteUrl: string, language: SeoLanguage): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAMES[language],
  description: DEFAULT_DESCRIPTION[language],
  url: siteUrl,
  inLanguage: htmlLang(language),
})

/** The head of a page with fixed text. */
export const staticPageHead = (page: StaticPageKey, requested: SeoLanguage, siteUrl: string): HeadModel => {
  const language = LEGAL_PAGES.includes(page) ? legalLanguage(requested) : requested
  const copy = PAGE_COPY[page][language]
  const base = `${siteUrl}${STATIC_PATHS[page] === '/' ? '' : STATIC_PATHS[page]}`
  const isHome = page === 'home'
  return {
    lang: language,
    title: copy.title,
    description: copy.description,
    canonicalUrl: withLanguage(isHome ? `${base}/` : base, language),
    image: defaultImage(siteUrl),
    ogType: 'website',
    noindex: false,
    alternates: LEGAL_PAGES.includes(page) ? [] : LANGUAGES.map((alternate) => ({ lang: alternate, url: withLanguage(isHome ? `${base}/` : base, alternate) })),
    jsonLd: isHome ? [websiteJsonLd(siteUrl, language)] : [],
  }
}

/** Pages that should not appear in search results: admin, offline, a vote session, the UI kit and every unknown address. */
export const privatePageHead = (title: string, siteUrl: string, canonicalPath: string | undefined, description: string = DEFAULT_DESCRIPTION.en): HeadModel => ({
  lang: 'en',
  title,
  description,
  canonicalUrl: canonicalPath === undefined ? '' : `${siteUrl}${canonicalPath}`,
  image: defaultImage(siteUrl),
  ogType: 'website',
  noindex: true,
  alternates: [],
  jsonLd: [],
})

const recipeJsonLd = (recipe: RecipeSeoInput, language: SeoLanguage, url: string, images: string[], description: string): Record<string, unknown> => {
  const text = recipe.languages[language]
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: text?.title ?? '',
    description,
    ...(images.length > 0 ? { image: images } : {}),
    url,
    inLanguage: htmlLang(language),
    ...(recipe.createdAt ? { datePublished: recipe.createdAt } : {}),
    ...(recipe.cuisine ? { recipeCuisine: recipe.cuisine } : {}),
    recipeIngredient: text?.ingredients ?? [],
    recipeInstructions: (text?.steps ?? []).map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step.content,
      ...(step.image ? { image: step.image } : {}),
    })),
    // The text is a copy of another site's page; the source is named so the credit travels with the data.
    ...(recipe.url ? { isBasedOn: recipe.url } : {}),
    publisher: { '@type': 'Organization', name: SITE_NAMES[language] },
  }
}

const recipeLanguage = (recipe: RecipeSeoInput, requested: SeoLanguage): SeoLanguage =>
  recipe.languages[requested] ? requested : (LANGUAGES.find((language) => recipe.languages[language]) ?? 'en')

/** The head of a recipe page in the requested language, or the first language the recipe has. */
export const recipeHead = (recipe: RecipeSeoInput, requested: SeoLanguage, siteUrl: string): HeadModel => {
  const language = recipeLanguage(recipe, requested)
  const text = recipe.languages[language]
  const base = `${siteUrl}/recipe/${recipe.slug}`
  const canonicalUrl = withLanguage(base, language)
  const images = [recipe.cover, ...(text?.steps ?? []).map((step) => step.image)]
    .filter((image): image is string => Boolean(image))
    .map((image) => absolute(siteUrl, image))
  const intro = text?.description || text?.steps[0]?.content || ''
  const description = shorten(intro || `${recipe.cuisine} ${DEFAULT_DESCRIPTION[language]}`.trim())
  return {
    lang: language,
    title: `${text?.title ?? ''} | ${SITE_NAMES[language]}`,
    description,
    canonicalUrl,
    image: images[0] ?? defaultImage(siteUrl),
    ogType: 'article',
    noindex: false,
    alternates: LANGUAGES.filter((alternate) => recipe.languages[alternate]).map((alternate) => ({ lang: alternate, url: withLanguage(base, alternate) })),
    jsonLd: [recipeJsonLd(recipe, language, canonicalUrl, images, description)],
  }
}

const tag = (name: string, attributes: Record<string, string>): string =>
  `<${name} ${Object.entries(attributes).map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ')} data-head>`

/** Safe inside a script element: `<` cannot start a closing tag. */
const jsonForScript = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')

/** The tags of one page's head, each marked `data-head` so the app can replace them when the route changes. */
export const renderHeadTags = (head: HeadModel): string =>
  [
    `<title data-head>${escapeHtml(head.title)}</title>`,
    tag('meta', { name: 'description', content: head.description }),
    tag('meta', { name: 'robots', content: head.noindex ? 'noindex, nofollow' : 'index, follow' }),
    ...(head.canonicalUrl ? [tag('link', { rel: 'canonical', href: head.canonicalUrl })] : []),
    ...head.alternates.map((alternate) => tag('link', { rel: 'alternate', hreflang: htmlLang(alternate.lang), href: alternate.url })),
    ...(head.alternates.length > 0 ? [tag('link', { rel: 'alternate', hreflang: 'x-default', href: head.alternates[0].url })] : []),
    tag('meta', { property: 'og:type', content: head.ogType }),
    tag('meta', { property: 'og:site_name', content: SITE_NAMES[head.lang] }),
    tag('meta', { property: 'og:locale', content: LOCALES[head.lang] }),
    tag('meta', { property: 'og:title', content: head.title }),
    tag('meta', { property: 'og:description', content: head.description }),
    ...(head.canonicalUrl ? [tag('meta', { property: 'og:url', content: head.canonicalUrl })] : []),
    tag('meta', { property: 'og:image', content: head.image }),
    tag('meta', { name: 'twitter:card', content: 'summary_large_image' }),
    tag('meta', { name: 'twitter:title', content: head.title }),
    tag('meta', { name: 'twitter:description', content: head.description }),
    tag('meta', { name: 'twitter:image', content: head.image }),
    ...head.jsonLd.map((data) => `<script type="application/ld+json" data-head>${jsonForScript(data)}</script>`),
  ].join('\n    ')

/** Puts one page's head and language into the app shell. */
export const renderShell = (shell: string, head: HeadModel): string =>
  shell.replace(HEAD_MARKER, () => renderHeadTags(head)).replace(/<html lang="[^"]*"/, () => `<html lang="${htmlLang(head.lang)}"`)

const VOTE_SESSION = /^\/vote\/[^/]+$/
const PRIVATE_PATHS = ['/admin', '/offline', '/ui']

/** Which kind of page the app shows for a path; the server uses it to answer 404 for the rest. */
export const routeKind = (pathname: string): RouteKind => {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  const page = (Object.keys(STATIC_PATHS) as StaticPageKey[]).find((key) => STATIC_PATHS[key] === path)
  if (page !== undefined) return page
  if (path === '/daily-vote') return 'voteNew'
  if (path.startsWith('/recipe/') && path.length > '/recipe/'.length) return 'recipe'
  if (VOTE_SESSION.test(path)) return 'voteSession'
  return PRIVATE_PATHS.includes(path) ? 'private' : 'notFound'
}

export const buildRobots = (siteUrl: string): string =>
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /vote/\nAllow: /vote/new\n\nSitemap: ${siteUrl}/sitemap.xml\n`

const PRIVATE_TITLES: Record<'private' | 'voteSession' | 'notFound', string> = {
  private: 'Recipe Collection (not for search)',
  voteSession: 'Recipe vote | Recipe Collection',
  notFound: 'Page not found | Recipe Collection',
}

/**
 * The head and status for every path that needs no data; undefined for a recipe, whose head is made
 * from the recipe. The server shell answers a vote session address here only when the session is unknown.
 */
export const headForPath = (pathname: string, language: SeoLanguage, siteUrl: string): { head: HeadModel; status: 200 | 404 } | undefined => {
  const kind = routeKind(pathname)
  if (kind === 'recipe') return undefined
  if (kind === 'private' || kind === 'voteSession' || kind === 'notFound') {
    return { head: privatePageHead(PRIVATE_TITLES[kind], siteUrl, undefined), status: kind === 'private' ? 200 : 404 }
  }
  return { head: staticPageHead(kind, language, siteUrl), status: 200 }
}
