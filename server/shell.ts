import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import type { Handler } from 'hono'
import { headForPath, isSeoLanguage, privatePageHead, recipeHead, renderShell } from '../scripts/seo.ts'
import type { HeadModel } from '../scripts/seo-types.ts'
import { findPublishedRecipeBySlug, toRecipeDetail } from './recipes.ts'
import type { ServerConfig } from './types.ts'

export const readShell = (staticDirectory: string): string | undefined => {
  try {
    return readFileSync(join(staticDirectory, 'index.html'), 'utf8')
  } catch {
    return undefined
  }
}

type Page = { head: HeadModel; status: 200 | 404 }

const pageFor = (database: DatabaseSync, config: ServerConfig, pathname: string, requested: string | undefined): Page => {
  const language = isSeoLanguage(requested) ? requested : 'en'
  const fixed = headForPath(pathname, language, config.siteUrl)
  if (fixed !== undefined) return fixed
  const recipe = findPublishedRecipeBySlug(database, pathname.slice('/recipe/'.length).replace(/\/$/, ''))
  return recipe
    ? { head: recipeHead(toRecipeDetail(recipe), language, config.siteUrl), status: 200 }
    : { head: privatePageHead('Recipe not found | Recipe Collection', config.siteUrl, undefined), status: 404 }
}

/**
 * Serves the app shell with the head of the page asked for, so search engines and share previews
 * read the right title, description, canonical address and structured data without running scripts.
 * An address the app does not know answers 404 with the app's own "page not found" screen.
 */
export const createShellHandler =
  (database: DatabaseSync, config: ServerConfig): Handler =>
  (context) => {
    const shell = readShell(config.staticDirectory)
    if (shell === undefined) return context.json({ error: 'Not found' }, 404)
    const { head, status } = pageFor(database, config, new URL(context.req.url).pathname, context.req.query('lang'))
    return context.html(renderShell(shell, head), status)
  }
