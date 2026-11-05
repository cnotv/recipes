import { join } from 'node:path'
import { serve } from '@hono/node-server'
import { createApp } from './app.ts'
import { loadConfig } from './config.ts'
import { createImageFetcher } from './safe-fetch.ts'
import { localizePublishedRecipes } from './media.ts'
import { openDatabase } from './database.ts'
import { seedRecipes } from './seed.ts'
import { purgeOldVoteSessions } from './vote-sessions.ts'

const config = loadConfig(process.env)
const database = openDatabase(config.databasePath)
const seeded = seedRecipes(database, join(import.meta.dirname, 'seed', 'recipes'))
if (seeded > 0) console.log(`Seeded ${seeded} recipes`)

// Not awaited, so the first start is not held back by hundreds of downloads. Until a
// picture is stored the API leaves it out, and a failed one is tried again at the next start.
void localizePublishedRecipes(database, { directory: config.mediaDirectory, fetchImage: createImageFetcher() })
  .then((count) => count > 0 && console.log(`Stored pictures of ${count} recipes`))
  .catch((error: unknown) => console.error(`Storing pictures failed: ${error instanceof Error ? error.message : 'unknown error'}`))

const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000
const purgeVotes = () => purgeOldVoteSessions(database, new Date())
purgeVotes()
const purgeTimer = setInterval(purgeVotes, PURGE_INTERVAL_MS)
purgeTimer.unref()

const server = serve({ fetch: createApp(database, config).fetch, port: config.port, hostname: config.host }, ({ port }) =>
  console.log(`Recipes server listening on port ${port}`),
)

const shutdown = () => server.close(() => database.close())
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
