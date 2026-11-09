ALTER TABLE users ADD COLUMN display_name_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_display_name_key_unique ON users(display_name_key);
