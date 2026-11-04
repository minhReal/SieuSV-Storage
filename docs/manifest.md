# SVS Manifest Reference

A manifest describes one GitHub-hosted script or plugin so the SieuSV Library Worker can safely discover its metadata and allowed source files.

The filename must be exactly `SVS.json` or `svs.json`. Place it at the root of the script's folder.

## Example

```json
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
```

## Fields

| Field | Required | Description |
| --- | --- | --- |
| `schema_version` | Recommended | Manifest schema version. Current value: `1`. |
| `id` | Recommended | Stable unique identifier, lowercase letters, digits and hyphens. |
| `title` | Recommended | Display name in the library. |
| `description` | No | Short description. |
| `category` | No | Display category. Use `Plugins` for plugins and `Other` for utilities. Legacy `Studio Tools` values are displayed as `Plugins`. |
| `tag` | No | Custom display tag. Defaults to `Github`. |
| `method` | No | `source`, `import` or `both`; defaults to `source`. |
| `source` | Conditional | Relative path to the main Lua/Luau file for `source` or `both`. |
| `files` | Recommended | Allowed files for the script page. Entries may be strings or objects with `path` and optional `role`. |
| `import_parts` | Conditional | Relative paths to String Import part files for `import` or `both`. |
| `thumbnail` | No | Relative image path. Use `null` when no custom image is provided. The website uses `thumDefault.jpg` as a fallback. |

## Upload methods

- `source`: provide a valid `source` path. The file must also be present in `files` or be added automatically as the main source.
- `import`: provide at least one valid file in `import_parts`.
- `both`: provide both a main source file and one or more import parts.

The website lists no more than 100 manifest files and no more than 20 import parts per script. Source file paths must exist in the same repository folder tree and must be relative. Absolute paths, parent traversal segments, backslashes, URL query strings and fragments are not accepted.

## File roles

Use clear roles to help maintainers understand a folder:

- `main`: primary source file.
- `helper`: supporting code.
- `documentation`: README or guide.
- `button`: optional UI/button source.
- `manifest`: manifest file itself.
- `import_part`: String Import payload.

## Validation checklist

- JSON parses without comments or trailing commas.
- The ID is unique and matches `[a-z0-9][a-z0-9-]*`.
- Every file path exists and stays inside the script folder.
- Source and import files match the selected method.
- The title and description accurately describe behavior and limitations.
- Thumbnail is an image in the repository and does not contain misleading content.
- No secrets, access tokens, private links or personal information are included.
- You own the code or have permission to redistribute it.

Manifest paths are relative to the directory containing the manifest, not to the repository root.
