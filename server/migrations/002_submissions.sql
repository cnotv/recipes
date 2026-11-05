CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'importing', 'translating', 'pending', 'published', 'rejected', 'failed')),
  reason TEXT,
  translated INTEGER NOT NULL DEFAULT 0,
  recipe_id INTEGER REFERENCES recipes (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX submissions_status ON submissions (status, created_at);
