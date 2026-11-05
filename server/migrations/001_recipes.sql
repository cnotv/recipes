CREATE TABLE recipes (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  source_url TEXT UNIQUE,
  cuisine TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('published', 'pending', 'rejected')),
  cover_image TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX recipes_status_created_at ON recipes (status, created_at);
CREATE INDEX recipes_cuisine ON recipes (cuisine);
CREATE INDEX recipes_difficulty ON recipes (difficulty);

CREATE TABLE recipe_translations (
  recipe_id INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  PRIMARY KEY (recipe_id, language)
);

CREATE INDEX recipe_translations_language ON recipe_translations (language);
