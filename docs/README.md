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

### Community content flow

```text
Signed-in creator
  └─ Upload or edit a public script
       ↓
Cloudflare Worker validates the request
       ↓
D1 stores script metadata and content
       ↓
A script_versions snapshot is stored
       ↓
Website displays the current version and history
```

Every new community upload receives an initial version snapshot. Every successful owner update creates another snapshot and stores the supplied changelog. Existing scripts without snapshots start their history when they are first edited after this feature is enabled.

### Reports

A signed-in user can submit a report against a public Community script or a manifest-backed GitHub script. The Worker verifies that the target exists, validates the reason and details, applies a per-account rate limit and prevents a repeat open report for the same target within the duplicate-check window.

Reports are stored in D1 for maintainer review. The public API does not expose report records or reporter details.

## Security notes

- Never commit API keys, OAuth secrets, session cookies, passwords, private URLs or personal information.
- Treat all contributed source code as untrusted until reviewed.
- The script detail page renders report text and version source as text, not executable HTML.
- Report submission and community edits require an authenticated account.
- Do not add a second Worker or change the existing D1 binding for routine feature work.

## Maintenance

When changing a manifest field or API response, update the matching guide and keep the website and Worker behavior in sync. Test both GitHub-backed and Community scripts, including mobile layouts.
