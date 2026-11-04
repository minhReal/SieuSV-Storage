# Website API Reference

Base URL:

{T}https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev{T}

All API responses are JSON unless a route returns a redirect or HTML page. The website uses the same existing Cloudflare Worker and D1 database.

## Public library endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | {T}/api/health{T} | Worker and D1 health status. |
| GET | {T}/api/github/scripts{T} | GitHub-backed scripts discovered from repository manifests. |
| GET | {T}/api/github/script?path=...{T} | Metadata and an allowed source/import file for a GitHub script. |
| GET | {T}/api/github/script/history?path=...{T} | Recent GitHub commits affecting the specified script folder. |
| GET | {T}/api/scripts{T} | Public Community scripts. |
| GET | {T}/api/scripts/{id}{T} | A public Community script and its current metadata/content. |
| GET | {T}/api/scripts/{id}/versions{T} | Version list and changelog metadata. |
| GET | {T}/api/scripts/{id}/versions/{number}{T} | The stored content and metadata for one historical version. |

The GitHub {T}path{T} parameter is the script folder from its repository manifest. The Community {T}id{T} is the script UUID returned after upload.

## Authentication

Google sign-in is used for account-dependent actions. The browser keeps the session in an HTTP-only cookie.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | {T}/auth/google{T} | Start Google sign-in. |
| GET | {T}/api/me{T} | Read the current account profile. |
| POST | {T}/auth/logout{T} | End the current session. |
| POST | {T}/api/scripts{T} | Publish a Community script. |
| PUT | {T}/api/scripts/{id}{T} | Update a script owned by the signed-in user. |
| POST | {T}/api/scripts/{id}/vote{T} | Vote on a public Community script. |
| POST | {T}/api/reports{T} | Submit a report about a public Community or GitHub script. |

State-changing requests require same-origin JSON requests and an authenticated account where applicable. Do not call account endpoints with another user's session.

## Version history

A new Community upload creates version 1 with the changelog {T}Initial release{T}. When the owner saves an update, the Worker stores a snapshot containing title, description, category, source, thumbnail, upload method and import parts.

The update request accepts an optional {T}changelog{T} string with a maximum of 300 characters. If omitted, the Worker records {T}Updated script{T}. A legacy script without history receives a baseline snapshot before its first tracked update.

GitHub history is read from the repository's commit API and is not copied into D1.

## Report submission

Submit a JSON body with either {T}script_id{T} or {T}github_path{T}, but not both:

{F}json
{
  "script_id": "community-script-uuid",
  "reason": "broken",
  "details": "The source listed in the page does not match the documented behavior."
}
{F}

For a GitHub entry, replace {T}script_id{T} with {T}github_path{T} containing the exact manifest folder path.

Supported reasons:

- {T}broken{T}: broken or misleading behavior.
- {T}unsafe{T}: unsafe content.
- {T}spam{T}: spam or abuse.
- {T}copyright{T}: copyright concern.
- {T}other{T}: another review concern.

Details must contain 10 to 1,000 characters. Sign-in is required. The server limits each account to five report attempts per one-hour window and rejects a duplicate open report for the same target within 24 hours.

A successful response is HTTP 201 and includes {T}ok{T}, a report ID and the initial {T}open{T} status. Report records are private to the service and are not exposed through the public API.

## Error handling

Clients should check {T}response.ok{T} and handle the returned {T}error{T} and optional {T}message{T} fields. Common statuses include:

- {T}400{T}: invalid JSON, path, reason, version or input.
- {T}401{T}: authentication required.
- {T}403{T}: same-origin/security check rejected the request.
- {T}404{T}: script or requested version not found.
- {T}409{T}: duplicate open report.
- {T}413{T}: payload too large.
- {T}429{T}: rate limit reached.
- {T}502{T}: upstream GitHub or database service unavailable.

The API may add fields over time. Clients should ignore fields they do not use.
