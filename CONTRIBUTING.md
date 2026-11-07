# Contributing to SieuSV-Storage

Thank you for helping improve the script library. Contributions can add a plugin, improve existing source or documentation, fix a website issue, or report a problem.

Before starting, read the [repository README](README.md), [documentation index](docs/README.md), and [manifest reference](docs/manifest.md).

## Ways to contribute

- **GitHub Pull Request:** add or update repository files and submit a PR against `main`.
- **Website upload:** publish a Community script from the website's Upload page. This does not require a repository manifest.
- **Issue:** report a reproducible bug or suggest an improvement using the repository's issue template.

## Adding a GitHub script

1. Fork `minhReal/SieuSV-Storage`.
2. Create a focused branch for your change.
3. Add a dedicated folder under `Sieu-SV Plugins/` or `Other/`, as appropriate.
4. Add `SVS.json` or `svs.json` at the script folder root.
5. Add the source files and any required documentation or assets.
6. Validate all manifest paths and confirm every listed file exists.
7. Test the script in its intended Roblox/Studio Lite environment.
8. Open a Pull Request with base branch `main` and complete the PR template.

See [Manifest Reference](docs/manifest.md) for the supported schema and upload methods.

## Code and content expectations

- Keep each contribution focused and give files descriptive names.
- Prefer readable Luau and explain non-obvious behavior in the script's own documentation.
- State required script type, placement, permissions, supported rig/platform and playtest limitations.
- Avoid unnecessary HTTP requests, hidden side effects or unrelated changes.
- Do not include code that steals credentials, collects private data, damages projects or misleads users about what it does.
- Do not commit secrets, passwords, access tokens, private URLs or personal information.
- Only contribute code and assets that you created or have permission to redistribute.
- Preserve existing folder names and manifest paths unless the change intentionally migrates them.

## Website and Worker changes

When changing the website or Worker:

- Keep the existing Worker and D1 architecture; do not introduce a second backend for a small feature.
- Keep server-side validation for every client-submitted value.
- Use prepared D1 statements for values and do not concatenate user input into SQL.
- Keep private report data and account identifiers out of public responses.
- Update the matching files under `docs/` when API or manifest behavior changes.
- Test GitHub and Community script pages, signed-in and signed-out states, and narrow/mobile layouts.

## Pull Request checklist

- [ ] The PR targets `main`.
- [ ] The title describes the change.
- [ ] The description explains the purpose and user-visible impact.
- [ ] New or changed manifests are valid JSON and all paths exist.
- [ ] Source code was tested in the intended environment, or limitations are stated.
- [ ] No secrets, private data or unauthorized assets are included.
- [ ] Documentation is updated where necessary.
- [ ] UI changes were checked on a mobile-sized viewport when practical.

Maintainers may request changes, ask for a smaller scope, or close submissions that cannot be verified or do not meet the repository's license and safety requirements.
