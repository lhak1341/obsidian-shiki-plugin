# obsidian-shiki-plugin

Fork of mProjectsCode/obsidian-shiki-plugin. Upstream remote: https://github.com/mProjectsCode/obsidian-shiki-plugin.git
Sync upstream: `git fetch upstream && git merge upstream/master`
Deploy to vault: `bun run deploy`

## ESLint
`eslint-plugin-obsidianmd` must be integrated manually (plugin object + rules in the existing config block) — spreading `obsidianmd.configs.recommended` conflicts with the project's `eslint-plugin-import-x` which is also registered as `import`.

## Known build warnings
`[MIXED_EXPORTS]` on `bun run deploy` is benign — Obsidian's loader reads `module.default` correctly.

## Package structure
`ec-core/` runs at both Vite build time and plugin runtime — put shared code there, not in `obsidian/`.

## Settings invariant
`loadedSettings` is the engine snapshot (cloned on startup/reload); `settings` is the persistence layer. Any setting that should take effect without a full reload must write both copies in `SettingsTab.onChange`.
