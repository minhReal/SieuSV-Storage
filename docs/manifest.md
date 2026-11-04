# SVS Manifest Reference

A manifest describes one GitHub-hosted script or plugin so the SieuSV Library Worker can safely discover its metadata and allowed source files.

The filename must be exactly {T}SVS.json{T} or {T}svs.json{T}. Place it at the root of the script's folder.

## Example

{F}json
{
  "schema_version": 1,
  "id": "my-script",
  "title": "My Script",
  "description": "A short description of the script.",
  "category": "Plugins",
  "tag": "Github",
  "method": "source",
  "source": "Main.lua",
  "files": [
    { "path": "Main.lua", "role": "main" },
    { "path": "Helper.lua", "role": "helper" },
    { "path": "README.md", "role": "documentation" }
  ],
  "import_parts": [],
  "thumbnail": null
}
{F}

## Fields

| Field | Required | Description |
| --- | --- | --- |
| {T}schema_version{T} | Recommended | Manifest schema version. Current value: {T}1{T}. |
| {T}id{T} | Recommended | Stable unique identifier, lowercase letters, digits and hyphens. |
| {T}title{T} | Recommended | Display name in the library. |
| {T}description{T} | No | Short description. |
| {T}category{T} | No | Display category. Use {T}Plugins{T} for plugins and {T}Other{T} for utilities. Legacy {T}Studio Tools{T} values are displayed as {T}Plugins{T}. |
| {T}tag{T} | No | Custom display tag. Defaults to {T}Github{T}. |
| {T}method{T} | No | {T}source{T}, {T}import{T} or {T}both{T}; defaults to {T}source{T}. |
| {T}source{T} | Conditional | Relative path to the main Lua/Luau file for {T}source{T} or {T}both{T}. |
| {T}files{T} | Recommended | Allowed files for the script page. Entries may be strings or objects with {T}path{T} and optional {T}role{T}. |
| {T}import_parts{T} | Conditional | Relative paths to String Import part files for {T}import{T} or {T}both{T}. |
| {T}thumbnail{T} | No | Relative image path. Use {T}null{T} when no custom image is provided. The website uses {T}thumDefault.jpg{T} as a fallback. |

## Upload methods

- {T}source{T}: provide a valid {T}source{T} path. The file must also be present in {T}files{T} or be added automatically as the main source.
- {T}import{T}: provide at least one valid file in {T}import_parts{T}.
- {T}both{T}: provide both a main source file and one or more import parts.

The website lists no more than 100 manifest files and no more than 20 import parts per script. Source file paths must exist in the same repository folder tree and must be relative. Absolute paths, parent traversal segments, backslashes, URL query strings and fragments are not accepted.

## File roles

Use clear roles to help maintainers understand a folder:

- {T}main{T}: primary source file.
- {T}helper{T}: supporting code.
- {T}documentation{T}: README or guide.
- {T}button{T}: optional UI/button source.
- {T}manifest{T}: manifest file itself.
- {T}import_part{T}: String Import payload.

## Validation checklist

- JSON parses without comments or trailing commas.
- The ID is unique and matches {T}[a-z0-9][a-z0-9-]*{T}.
- Every file path exists and stays inside the script folder.
- Source and import files match the selected method.
- The title and description accurately describe behavior and limitations.
- Thumbnail is an image in the repository and does not contain misleading content.
- No secrets, access tokens, private links or personal information are included.
- You own the code or have permission to redistribute it.

Manifest paths are relative to the directory containing the manifest, not to the repository root.
