import { z } from 'zod'
import type { ServerConfig } from './types.ts'

const LOOPBACK_HOSTS = 'localhost,127.0.0.1,[::1]'
const DEFAULT_PORT = 4330

const environmentSchema = z.object({
  RECIPES_HOST: z.string().min(1).default('127.0.0.1'),
  RECIPES_PORT: z.coerce.number().int().min(1).max(65535).default(DEFAULT_PORT),
  RECIPES_DB_PATH: z.string().min(1).default('data/recipes.db'),
  RECIPES_ALLOWED_HOSTS: z.string().default(LOOPBACK_HOSTS),
  RECIPES_STATIC_DIR: z.string().min(1).default('dist'),
  RECIPES_SITE_URL: z.string().url().optional(),
})

/** Reads and validates the server settings; throws a readable error on a bad value. */
export const loadConfig = (environment: NodeJS.ProcessEnv): ServerConfig => {
  const values = environmentSchema.parse(environment)
  return {
    host: values.RECIPES_HOST,
    port: values.RECIPES_PORT,
    databasePath: values.RECIPES_DB_PATH,
    allowedHosts: values.RECIPES_ALLOWED_HOSTS.split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
    staticDirectory: values.RECIPES_STATIC_DIR,
    siteUrl: values.RECIPES_SITE_URL ?? `http://localhost:${values.RECIPES_PORT}`,
  }
}
