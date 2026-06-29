# obsidian-shiki-plugin

Fork of mProjectsCode/obsidian-shiki-plugin. Upstream remote: https://github.com/mProjectsCode/obsidian-shiki-plugin.git
Sync upstream: `git fetch upstream && git merge upstream/master`
Deploy to vault: `bun run deploy`

## ESLint
`eslint-plugin-obsidianmd` must be integrated manually (plugin object + rules in the existing config block) — spreading `obsidianmd.configs.recommended` conflicts with the project's `eslint-plugin-import-x` which is also registered as `import`.

## Known build warnings
`[MIXED_EXPORTS]` on `bun run deploy` is benign — Obsidian's loader reads `module.default` correctly.
