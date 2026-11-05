CREATE TABLE vote_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  closed_at TEXT
);

CREATE INDEX vote_sessions_ends_at ON vote_sessions (ends_at);

CREATE TABLE vote_session_recipes (
  session_id TEXT NOT NULL REFERENCES vote_sessions (id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (session_id, recipe_id)
);

CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES vote_sessions (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (id, session_id)
);

CREATE INDEX participants_session_id ON participants (session_id);

-- The composite keys make a vote valid only for a participant and a recipe of its own session.
CREATE TABLE votes (
  session_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  recipe_id INTEGER NOT NULL,
  voted_at TEXT NOT NULL,
  UNIQUE (session_id, participant_id),
  FOREIGN KEY (participant_id, session_id) REFERENCES participants (id, session_id) ON DELETE CASCADE,
  FOREIGN KEY (session_id, recipe_id) REFERENCES vote_session_recipes (session_id, recipe_id) ON DELETE CASCADE
);
