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

To release, run `npm version patch` (or `minor`, `major`). It updates
`manifest.json` and `versions.json`, commits, and creates the tag. Then push
the commit and the tag: `git push && git push --tags`. The release workflow
builds the plugin and creates a draft GitHub release. Publish the draft to
make it available in Obsidian.

The README is shown as the plugin's description in Obsidian's community
plugin directory, so keep it for users. Developer notes go here.

See [`AGENTS.md`](AGENTS.md) for design notes.
