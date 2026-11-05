import { mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { dirname, join } from 'node:path'

const migrationsDirectory = join(import.meta.dirname, 'migrations')
const IN_MEMORY = ':memory:'

const runMigrations = (database: DatabaseSync): void => {
  database.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)')
  const applied = new Set(
    database
      .prepare('SELECT name FROM schema_migrations')
      .all()
      .map((row) => String(row.name)),
  )
  readdirSync(migrationsDirectory)
    .filter((name) => name.endsWith('.sql') && !applied.has(name))
    .sort()
    .forEach((name) => {
      database.exec('BEGIN')
      database.exec(readFileSync(join(migrationsDirectory, name), 'utf8'))
      database.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(name, new Date().toISOString())
      database.exec('COMMIT')
    })
}

/** Opens the database (creating its folder), turns on foreign keys and applies pending migrations. */
export const openDatabase = (path: string): DatabaseSync => {
  if (path !== IN_MEMORY) mkdirSync(dirname(path), { recursive: true })
  const database = new DatabaseSync(path)
  database.exec('PRAGMA foreign_keys = ON')
  runMigrations(database)
  return database
}
