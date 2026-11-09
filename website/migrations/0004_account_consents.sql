CREATE TABLE IF NOT EXISTS account_consents (
  google_sub TEXT PRIMARY KEY NOT NULL,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL
);
