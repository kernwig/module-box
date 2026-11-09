# Developing Module Box

Requires Node 24 (see `.nvmrc`).

```sh
npm install
npm run check      # typecheck, tests, and lint; all must pass
                   # lint includes Obsidian's review rules (eslint-plugin-obsidianmd)
npm run build      # writes the plugin files to dist/
```

To try a build in a vault, set `OBSIDIAN_VAULT` to the vault folder. `npm run
build` then also copies `dist/` into
`<vault>/.obsidian/plugins/module-box/`, and `npm run dev` does the same on
every change. Toggle the plugin off and on in Obsidian to load the new build.

```sh
OBSIDIAN_VAULT="$HOME/path/to/vault" npm run dev
```

## Releasing a new version

1. **Ensure all checks pass:**
   ```sh
   npm run check
   ```

2. **Bump the version** (choose `patch`, `minor`, or `major`):
   ```sh
   npm version patch
   ```
   This updates `manifest.json` and `versions.json`, commits the changes, and
   creates a git tag matching the new version (no `v` prefix — Obsidian
   requires the tag to exactly match the version).

3. **Push the commit and tag:**
   ```sh
   git push && git push --tags
   ```

4. **Wait for the workflow:** The `.github/workflows/release.yml` workflow runs
   automatically when the tag is pushed. It builds the plugin and creates a
   draft GitHub release with `main.js`, `manifest.json`, and `styles.css`
   attached.

5. **Publish the draft release** on GitHub to make it available in Obsidian's
   community plugin directory.

The README is shown as the plugin's description in Obsidian's community
plugin directory, so keep it for users. Developer notes go here.

See [`AGENTS.md`](AGENTS.md) for design notes.
