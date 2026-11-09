# Documentation

This directory contains implementation and contribution references for SieuSV-Storage.

## Guides

- [Manifest format](manifest.md) explains how GitHub-hosted scripts are discovered and described.
- [Website API](api.md) documents the public read-only library endpoints.
- [Privacy Policy](privacy-policy.md) describes account data, Google sign-in, account deletion and D1 recovery history.
- [Terms and Conditions](terms-of-service.md) describes the read-only service and account-deletion process.

For contribution workflow and review expectations, see [CONTRIBUTING.md](../CONTRIBUTING.md). The repository overview and plugin catalogue are in the [root README](../README.md).

## Project architecture

SieuSV-Storage has two content sources:

1. **GitHub scripts** live in this repository. Each script folder contains an `SVS.json` or `svs.json` manifest and the files listed by that manifest.
2. **Legacy community records** may remain in Cloudflare D1 from earlier website features. Uploads, profile edits, votes and reports are currently disabled and the read-only website does not expose those records.

The existing Cloudflare Worker serves the website, handles Google OAuth and account requests, reads the GitHub manifest tree, and connects to D1. The website does not create a second backend.

### GitHub content flow

```text
GitHub main branch
  └─ category/script-folder/
      ├─ SVS.json
      ├─ Main.lua
      └─ optional helper/docs/assets
          ↓
Worker reads the repository tree and manifests
          ↓
Validated metadata appears in /api/github/scripts
          ↓
Script page loads only files listed in the manifest
```

The Worker caches the manifest index and individual source files. A script's GitHub version history is based on commits that changed its folder.

### Legacy community records and account deletion

Community uploads, profile edits, votes and report submissions are currently paused. Existing D1 tables and historical records have not been removed, but the read-only website does not expose the paused community APIs.

The Google OAuth account flow is still active. A signed-in user can request account deletion from Profile. The Worker asks the user to select the same Google account again, validates the returned Google subject against the active session and requires the exact text `DELETE` before executing the account cleanup batch.

The cleanup removes the user's profile and consent receipt, sessions (by deleting the user row), username history, rate-limit records, submitted reports, likes, votes, community scripts and script-version rows. It also detaches editor attribution from other users' version history. The delete process does not enable any other community write operation.

The account-deletion API and the current service state are described in [Website API](api.md), [Privacy Policy](privacy-policy.md) and [Terms and Conditions](terms-of-service.md).

## Security notes

- Never commit API keys, OAuth secrets, session cookies, passwords, private URLs or personal information.
- Treat all contributed source code as untrusted until reviewed.
- The script detail page renders report text and version source as text, not executable HTML.
- Report submission and community edits require an authenticated account.
- Do not add a second Worker or change the existing D1 binding for routine feature work.

## Maintenance

When changing a manifest field or API response, update the matching guide and keep the website and Worker behavior in sync. Test both GitHub-backed and Community scripts, including mobile layouts.
