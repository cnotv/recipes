export type SeoLanguage = 'en' | 'de' | 'jp' | 'th'

/** Pages that have fixed text; recipe pages take theirs from the recipe. */
export type StaticPageKey = 'home' | 'voteNew' | 'submit' | 'impressum' | 'datenschutz'

export type PageCopy = { title: string; description: string }

/** Everything the tags in the `<head>` of one page are made of. */
export type HeadModel = {
  lang: SeoLanguage
  title: string
  description: string
  canonicalUrl: string
  /** Absolute address of the picture shown when the page is shared. */
  image: string
  ogType: 'website' | 'article'
  noindex: boolean
  /** The same page in other languages, for hreflang. */
  alternates: { lang: SeoLanguage; url: string }[]
  jsonLd: Record<string, unknown>[]
}

export type SeoRecipeText = { title: string; description?: string; ingredients: string[]; steps: { content: string; image: string }[] }

/** The part of a recipe the head needs; the detail API returns exactly this shape. */
export type RecipeSeoInput = {
  slug: string
  url: string
  cuisine: string
  cover?: string
  createdAt?: string
  languages: Record<string, SeoRecipeText | undefined>
}

/** What the router would show for a path, so the server can answer 404 for a path the app does not know. */
export type RouteKind = StaticPageKey | 'recipe' | 'voteSession' | 'private' | 'notFound'
