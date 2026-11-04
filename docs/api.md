# Website API Reference

Base URL:

`https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev`

All API responses are JSON unless a route returns a redirect or HTML page. The website uses the same existing Cloudflare Worker and D1 database.

## Public library endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Worker and D1 health status. |
| GET | `/api/github/scripts` | GitHub-backed scripts discovered from repository manifests. |
| GET | `/api/github/script?path=...` | Metadata and an allowed source/import file for a GitHub script. |
| GET | `/api/github/script/history?path=...` | Recent GitHub commits affecting the specified script folder. |
| GET | `/api/scripts` | Public Community scripts. |
| GET | `/api/scripts/{id}` | A public Community script and its current metadata/content. |
| GET | `/api/scripts/{id}/versions` | Version list and changelog metadata. |
| GET | `/api/scripts/{id}/versions/{number}` | The stored content and metadata for one historical version. |

The GitHub `path` parameter is the script folder from its repository manifest. The Community `id` is the script UUID returned after upload.

## Authentication

Google sign-in is used for account-dependent actions. The browser keeps the session in an HTTP-only cookie.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/auth/google` | Start Google sign-in. |
| GET | `/api/me` | Read the current account profile. |
| POST | `/auth/logout` | End the current session. |
| POST | `/api/scripts` | Publish a Community script. |
| PUT | `/api/scripts/{id}` | Update a script owned by the signed-in user. |
| POST | `/api/scripts/{id}/vote` | Vote on a public Community script. |
| POST | `/api/reports` | Submit a report about a public Community or GitHub script. |

State-changing requests require same-origin JSON requests and an authenticated account where applicable. Do not call account endpoints with another user's session.

## Version history

A new Community upload creates version 1 with the changelog `Initial release`. When the owner saves an update, the Worker stores a snapshot containing title, description, category, source, thumbnail, upload method and import parts.

The update request accepts an optional `changelog` string with a maximum of 300 characters. If omitted, the Worker records `Updated script`. A legacy script without history receives a baseline snapshot before its first tracked update.

GitHub history is read from the repository's commit API and is not copied into D1.

## Report submission

Submit a JSON body with either `script_id` or `github_path`, but not both:

```json
{
  "script_id": "community-script-uuid",
  "reason": "broken",
  "details": "The source listed in the page does not match the documented behavior."
}
```

For a GitHub entry, replace `script_id` with `github_path` containing the exact manifest folder path.

Supported reasons:

- `broken`: broken or misleading behavior.
- `unsafe`: unsafe content.
- `spam`: spam or abuse.
- `copyright`: copyright concern.
- `other`: another review concern.

Details must contain 10 to 1,000 characters. Sign-in is required. The server limits each account to five report attempts per one-hour window and rejects a duplicate open report for the same target within 24 hours.

A successful response is HTTP 201 and includes `ok`, a report ID and the initial `open` status. Report records are private to the service and are not exposed through the public API.

## Error handling

Clients should check `response.ok` and handle the returned `error` and optional `message` fields. Common statuses include:

- `400`: invalid JSON, path, reason, version or input.
- `401`: authentication required.
- `403`: same-origin/security check rejected the request.
- `404`: script or requested version not found.
- `409`: duplicate open report.
- `413`: payload too large.
- `429`: rate limit reached.
- `502`: upstream GitHub or database service unavailable.

The API may add fields over time. Clients should ignore fields they do not use.
