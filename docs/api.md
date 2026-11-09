# Website API Reference

Base URL:

`https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev`

All API responses are JSON unless a route returns a redirect or HTML page. The website uses the existing Cloudflare Worker and D1 database.

## Public read-only library endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Worker and D1 health status. |
| GET | `/api/github/scripts` | GitHub-backed scripts discovered from repository manifests. |
| GET | `/api/github/script?path=...` | Metadata and an allowed source/import file for a GitHub script. |
| GET | `/api/github/script/history?path=...` | Recent GitHub commits affecting the specified script folder. |
| GET | `/api/scripts` | Returns an empty list while legacy Community features are paused. |

Community uploads, community-script retrieval, profile editing, votes and reports remain disabled. Legacy community tables may remain in D1 but are not exposed through the read-only website.

## Authentication and account

Google OAuth is used for account access. The browser keeps the session in a Secure, HttpOnly cookie. New account records are created only after Google returns a verified identity, the user reviews the prefilled details and submits the Create account form.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/google` | Start Google sign-in after the current Terms and Privacy acknowledgement. |
| GET | `/auth/google/callback` | Handle the normal Google sign-in callback or the account-deletion verification callback. |
| GET | `/auth/pending` | Read the short-lived pending-registration profile defaults. |
| POST | `/auth/complete-account` | Create a new website account after registration confirmation. |
| GET | `/api/me` | Read the current account profile. |
| POST | `/auth/logout` | End the current session. |

## Delete Account flow

Delete Account is a dedicated account-rights action; it does not enable community uploads, profile edits, votes or reports.

1. A signed-in user sends a same-origin JSON `POST /auth/delete/start` request. The Worker returns a Google OAuth URL and sets a signed, short-lived deletion-state cookie.
2. The user selects a Google account. The existing OAuth callback verifies that Google's returned stable account identifier matches the currently signed-in account.
3. A successful match redirects to `/?page=profile&delete=confirm` and sets a five-minute signed confirmation cookie.
4. The user types `DELETE` and sends a same-origin JSON `POST /auth/delete-account` request with `{"confirmation":"DELETE"}`.
5. The Worker verifies the active session, signed confirmation ticket, expiry and exact confirmation string, then deletes the account and associated active D1 records in a batch. It clears the session and deletion cookies.

To cancel the final confirmation, send a same-origin JSON `POST /auth/delete/cancel` request. Starting Google verification, selecting another Google account, cancelling or letting the ticket expire never deletes the account.

Google's `select_account` prompt asks the user to select an account; it does not necessarily force password entry if Google already has a valid browser session. The Worker still compares the returned Google subject to the current account before allowing final confirmation.

A successful deletion removes the user row, consent receipt, username history, rate-limit rows, account-submitted reports, votes, likes, owned community scripts and their versions. It also detaches editor attribution from versions belonging to other users. It does not delete the Google Account or public GitHub commits, forks or third-party copies. Cloudflare D1 Time Travel may keep provider-managed restore points for a limited period; see the [Privacy Policy](privacy-policy.md).

## Request security

State-changing requests require same-origin JSON requests and an authenticated account where applicable. The Worker rejects cross-origin writes. Do not call account endpoints with another user's session, and never share session cookies or signed confirmation cookies.

## Error handling

Clients should check `response.ok` and handle returned `error` and optional `message` fields.

- `400`: invalid JSON or confirmation text.
- `401`: authentication, session or Google identity verification required.
- `403`: same-origin/security check rejected the request or Google account did not match.
- `405` / `503`: a community write or legacy community API is disabled.
- `413`: payload too large.
- `502`: upstream Google or GitHub service unavailable.

The API may add fields over time. Clients should ignore fields they do not use.
