PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 google_sub TEXT UNIQUE,
 username TEXT UNIQUE,
 display_name TEXT,
 display_name_key TEXT,
 avatar_url TEXT,
 bio TEXT DEFAULT '',
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 public_id TEXT,
 display_name_updated_at INTEGER,
 username_updated_at INTEGER,
 session_version INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS users_public_id_unique ON users(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_display_name_key_unique ON users(display_name_key);

CREATE TABLE IF NOT EXISTS account_consents (
  google_sub TEXT PRIMARY KEY NOT NULL,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL
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
 thumbnail_url TEXT,
 upload_method TEXT NOT NULL DEFAULT 'source',
 import_parts TEXT NOT NULL DEFAULT '[]',
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

CREATE TABLE IF NOT EXISTS profile_rate_limits (
 user_id TEXT PRIMARY KEY,
 window_start INTEGER NOT NULL,
 request_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS report_rate_limits (
 user_id TEXT PRIMARY KEY,
 window_start INTEGER NOT NULL,
 request_count INTEGER NOT NULL DEFAULT 0,
 FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reports (
 id TEXT PRIMARY KEY,
 reporter_user_id TEXT NOT NULL,
 script_id TEXT,
 github_path TEXT,
 script_title TEXT NOT NULL,
 reason TEXT NOT NULL,
 details TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'open',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(reporter_user_id) REFERENCES users(id),
 FOREIGN KEY(script_id) REFERENCES scripts(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(script_id, github_path);

CREATE TABLE IF NOT EXISTS script_versions (
 id TEXT PRIMARY KEY,
 script_id TEXT NOT NULL,
 version_number INTEGER NOT NULL,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 category TEXT NOT NULL DEFAULT 'Other',
 source TEXT NOT NULL DEFAULT '',
 thumbnail_url TEXT,
 upload_method TEXT NOT NULL DEFAULT 'source',
 import_parts TEXT NOT NULL DEFAULT '[]',
 changelog TEXT NOT NULL DEFAULT '',
 editor_user_id TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(script_id, version_number),
 FOREIGN KEY(script_id) REFERENCES scripts(id),
 FOREIGN KEY(editor_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_script_versions_script ON script_versions(script_id, version_number DESC);

CREATE TABLE IF NOT EXISTS script_votes (
 script_id TEXT NOT NULL,
 user_id TEXT NOT NULL,
 vote TEXT NOT NULL CHECK(vote IN ('like','dislike')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(script_id,user_id)
);

CREATE INDEX IF NOT EXISTS idx_script_votes_script ON script_votes(script_id);

CREATE TABLE IF NOT EXISTS upload_rate_limits (
 user_id TEXT PRIMARY KEY,
 window_start INTEGER NOT NULL,
 request_count INTEGER NOT NULL DEFAULT 0,
 FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS username_history (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id TEXT NOT NULL,
 username TEXT NOT NULL,
 changed_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_username_history_user_changed ON username_history(user_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS vote_rate_limits (
 user_id TEXT PRIMARY KEY,
 window_start INTEGER NOT NULL,
 request_count INTEGER NOT NULL DEFAULT 0,
 FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Existing databases must apply website/migrations/0002_session_version.sql once.
