import type { DatabaseSync } from 'node:sqlite'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { z } from 'zod'
import { buildSitemap } from '../scripts/recipe-metadata.ts'
import {
  findPublishedRecipeBySlug,
  findPublishedRecipeBySourceUrl,
  listAllPublishedRecipes,
  listCuisines,
  listPublishedRecipes,
  toProcessedRecipe,
  toRecipeDetail,
  toRecipeSummary,
} from './recipes.ts'
import { buildRobots } from '../scripts/seo.ts'
import { createShellHandler } from './shell.ts'
import { hostGuard, sameOriginJson } from './security.ts'
import { registerVoteRoutes } from './vote-routes.ts'
import { createDefaultServices } from './submission-services.ts'
import { registerSubmissionRoutes } from './submission-routes.ts'
import type { SubmissionServices } from './submission-types.ts'
import type { RecipeListResponse, ServerConfig } from './types.ts'

const MAX_PAGE_SIZE = 100

const listQuerySchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  cuisine: z.string().min(1).max(100).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  language: z.string().regex(/^[a-z]{2,3}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(12),
})

const slugSchema = z.string().regex(/^[a-z0-9-]{1,200}$/)

export const createApp = (
  database: DatabaseSync,
  config: ServerConfig,
  submissionServices: SubmissionServices = createDefaultServices(config),
): Hono => {
  const app = new Hono()

  app.use('*', hostGuard(config.allowedHosts))
  app.use('/api/*', sameOriginJson)

  app.get('/api/health', (context) => {
    database.prepare('SELECT 1').get()
    return context.json({ status: 'ok' })
  })

  app.get('/api/recipes', (context) => {
    const parsed = listQuerySchema.safeParse(context.req.query())
    if (!parsed.success) return context.json({ error: 'Invalid query', issues: parsed.error.issues }, 400)
    const now = new Date()
    const { recipes, total } = listPublishedRecipes(database, parsed.data)
    const body: RecipeListResponse = {
      items: recipes.map((recipe) => toRecipeSummary(recipe, now)),
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      total,
    }
    return context.json(body)
  })

  app.get('/api/recipes/:slug', (context) => {
    const slug = slugSchema.safeParse(context.req.param('slug'))
    const recipe = slug.success ? findPublishedRecipeBySlug(database, slug.data) : undefined
    return recipe ? context.json(toRecipeDetail(recipe)) : context.json({ error: 'Recipe not found' }, 404)
  })

  app.get('/api/cuisines', (context) => context.json(listCuisines(database)))

  registerVoteRoutes(app, database, config)
  registerSubmissionRoutes(app, database, config, submissionServices)

  app.all('/api/*', (context) => context.json({ error: 'Not found' }, 404))

  // File names are hashes of the source link, so a stored file never changes and may be cached for good.
  app.use(
    '/media/*',
    async (context, next) => {
      await next()
      if (context.res.ok) context.header('Cache-Control', 'public, max-age=31536000, immutable')
    },
    serveStatic({ root: config.mediaDirectory, rewriteRequestPath: (path) => path.replace(/^\/media/, '') }),
  )
  app.all('/media/*', (context) => context.text('Not found', 404))

  app.get('/sitemap.xml', (context) => {
    const now = new Date()
    const recipes = listAllPublishedRecipes(database).map((recipe) => toProcessedRecipe(recipe, now))
    return context.body(buildSitemap(recipes, config.siteUrl, now.toISOString().split('T')[0]), 200, {
      'Content-Type': 'application/xml; charset=UTF-8',
    })
  })

  // Links shared before slugs existed carry the encoded source URL instead of a slug.
  app.get('/recipe/:key', async (context, next) => {
    const key = context.req.param('key')
    const moved = /^https?:\/\//.test(key) ? findPublishedRecipeBySourceUrl(database, key) : undefined
    if (!moved) return next()
    return context.redirect(`/recipe/${moved.slug}${new URL(context.req.url).search}`, 301)
  })

  app.get('/robots.txt', (context) => context.text(buildRobots(config.siteUrl)))

  // "/" is answered here before the static handler, which would serve index.html without a page specific head.
  const shell = createShellHandler(database, config)
  app.get('/', shell)
  app.use('*', serveStatic({ root: config.staticDirectory }))
  app.get('*', shell)

  app.notFound((context) => context.json({ error: 'Not found' }, 404))
  app.onError((error, context) => {
    console.error(`Request failed: ${error.message}`)
    return context.json({ error: 'Internal server error' }, 500)
  })

  return app
}
