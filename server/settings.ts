import type { DatabaseSync } from 'node:sqlite'

/** The OpenRouter model chosen in the admin panel; when unset the OPENROUTER_MODEL default applies. */
export const OPENROUTER_MODEL_SETTING = 'openrouter_model'

export const readSetting = (database: DatabaseSync, key: string): string | undefined => {
  const row = database.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  return row === undefined ? undefined : String(row.value)
}

export const writeSetting = (database: DatabaseSync, key: string, value: string): void => {
  database
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value')
    .run(key, value)
}
