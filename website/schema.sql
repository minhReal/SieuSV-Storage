CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 google_sub TEXT UNIQUE,
 username TEXT UNIQUE,
 display_name TEXT,
 avatar_url TEXT,
 bio TEXT DEFAULT '',
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS scripts (
 id TEXT PRIMARY KEY,
 user_id TEXT,
 title TEXT NOT NULL,
 description TEXT DEFAULT '',
 category TEXT DEFAULT 'Other',
 source TEXT NOT NULL,
 visibility TEXT NOT NULL DEFAULT 'public',
 source_path TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_visibility ON scripts(visibility);
CREATE TABLE IF NOT EXISTS likes (
 user_id TEXT NOT NULL,
 script_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 PRIMARY KEY(user_id, script_id),
 FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(script_id) REFERENCES scripts(id)
);