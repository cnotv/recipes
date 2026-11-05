import type { DatabaseSync } from 'node:sqlite'
import { z } from 'zod'
import { createApp } from './app.ts'
import { createJobQueue } from './submission-services.ts'
import { createTestDatabase, testConfig } from './test-support.ts'
import type { ModelCall, PageFetcher, SubmissionServices } from './submission-types.ts'
import type { ServerConfig } from './types.ts'

export const ADMIN_TOKEN = 'a-long-admin-token-for-tests'
export const API_KEY = 'sk-or-test-secret-key-0001'

export const recipePage = (title = 'Tomato Soup', extra = ''): string =>
  `<html lang="en"><head><script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: title,
    recipeIngredient: ['4 tomatoes', 'salt'],
    recipeInstructions: [{ '@type': 'HowToStep', text: 'Chop.' }, { '@type': 'HowToStep', text: 'Simmer.' }],
    recipeCuisine: 'Italian',
  })}</script></head><body>${extra}</body></html>`

const translations = (ingredients: number, steps: number) =>
  Object.fromEntries(
    ['en', 'de', 'jp', 'th'].map((language) => [
      language,
      {
        title: `${language} title`,
        ingredients: Array.from({ length: ingredients }, (_, index) => `${language} ingredient ${index}`),
        steps: Array.from({ length: steps }, (_, index) => `${language} step ${index}`),
      },
    ]),
  )

/** A model stub: reads the system prompt to tell extraction from translation, as the real model would be asked. */
export const stubModel =
  (overrides: { extraction?: unknown; translation?: unknown | ((counts: { ingredients: number; steps: number }) => unknown) } = {}): ModelCall =>
  async ({ system, user }) => {
    if (system.includes('extract the recipe')) {
      return JSON.stringify(
        overrides.extraction ?? { title: 'Pasta', ingredients: ['pasta', 'salt'], steps: ['Boil.', 'Drain.'], cuisine: 'Italian', difficulty: 'Easy' },
      )
    }
    const source = z.object({ ingredients: z.array(z.string()), steps: z.array(z.string()) }).parse(JSON.parse(user))
    const counts = { ingredients: source.ingredients.length, steps: source.steps.length }
    const translation = overrides.translation
    return JSON.stringify(
      typeof translation === 'function' ? translation(counts) : (translation ?? translations(counts.ingredients, counts.steps)),
    )
  }

export const pagesFetcher =
  (pages: Record<string, string>): PageFetcher =>
  async (url) => {
    const body = pages[url]
    if (body === undefined) throw new Error('connect ECONNREFUSED 10.0.0.9:80')
    return { finalUrl: url, body }
  }

type Setup = {
  pages?: Record<string, string>
  callModel?: ModelCall
  config?: Partial<ServerConfig>
  now?: () => Date
}

export const createSubmissionTestApp = (setup: Setup = {}) => {
  const database: DatabaseSync = createTestDatabase()
  const queue = createJobQueue()
  const services: SubmissionServices = {
    fetchPage: pagesFetcher(setup.pages ?? {}),
    callModel: setup.callModel,
    queue,
    now: setup.now ?? (() => new Date()),
    lookup: async () => [{ address: '93.184.216.34', family: 4 }],
  }
  const app = createApp(database, { ...testConfig, adminToken: ADMIN_TOKEN, ...setup.config }, services)
  return { app, database, queue }
}

type TestApp = ReturnType<typeof createSubmissionTestApp>['app']

export const send = async (
  app: TestApp,
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
) =>
  await app.request(`http://localhost${path}`, {
    method,
    headers: { host: 'localhost:4330', 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

export const submissionBodySchema = z.object({ id: z.string(), status: z.string(), reason: z.string().optional() })

export const submit = async (app: TestApp, url: string, headers: Record<string, string> = {}) => {
  const response = await send(app, 'POST', '/api/submissions', { url }, headers)
  return { response, status: response.status, body: await response.json() }
}

/** Signs in as admin and returns the Cookie header for later requests. */
export const signIn = async (app: TestApp, token = ADMIN_TOKEN): Promise<Record<string, string>> => {
  const response = await send(app, 'POST', '/api/admin/session', { token })
  const cookie = response.headers.get('set-cookie')?.split(';')[0]
  return cookie === undefined ? {} : { cookie }
}
