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

## Settings
`SettingsStore` (settings/SettingsStore.ts) owns both layers: `_persisted` (written to disk) and `_snapshot` (engine's active view, flushed on reload). Use `store.set(key, value)` for reload-required settings and `store.setLive(key, value)` for live-effect settings (writes both layers immediately). `CodeHighlighter.reload()` internalizes the flush invariant: it calls `host.refreshSettings()` (which delegates to `store.flush()`) between `unload()` and `load()` — callers of `reload()` cannot forget the flush. Do not access `plugin.settings` or `plugin.loadedSettings` directly — they no longer exist.

## Testing
`tests/happydom.ts` polyfills Obsidian globals (`createDiv`, `sleep`, `HTMLElement.prototype.empty`); add new Obsidian module stubs to `tests/obsidianMock.ts`.
`@codemirror/state` types are bun-testable without DOM; `EditorView` requires integration tests, but `Decoration.*` from `@codemirror/view` is HappyDOM-testable — see `Cm6_DecorationBuilder.test.ts`.

## Narrow host interfaces
Modules take a narrow host interface (defined in the consuming file) instead of `ShikiPlugin`; `ShikiPlugin` satisfies them structurally via thin delegation methods in `main.ts`. Follow this pattern for new modules. Exception: `SettingsTab` extends Obsidian's `PluginSettingTab` whose constructor requires `(App, Plugin)` — it cannot be fully narrowed; it accesses `plugin.store` directly instead. `HighlighterHost` settings fields are opt-in — adding a field to `Settings` does not expose it to `CodeHighlighter`; you must explicitly add it to `HighlighterHost` (Highlighter.ts) and satisfy it in `main.ts`.

## Highlighter structure
`CodeHighlighter` (Highlighter.ts) is a lifecycle facade: owns custom theme/language loading, `ThemeMapper` construction, and `obsidianSafeLanguageNames()`. It delegates rendering to `EcRenderer` (EC/fenced blocks) and `ShikiRenderer` (Shiki/inline/CM6). Public lifecycle API: `load()`, `unload()`, `reload()` (preferred for settings-driven reloads — internalizes the flush ordering invariant).

## ec-core constraint
`ec-core/` cannot import from `packages/obsidian/` — it runs at Vite build time. `EcSettingsProps` in `Config.ts` is a parallel interface to `Settings`. `void (DEFAULT_SETTINGS satisfies EcSettingsProps)` in `Settings.ts` enforces compatibility at compile time — missing a field is a compile error. Apply `satisfies` to the declared variable, not the object literal (excess-property checking fires on literals).

Architecture Explore reports may describe methods or fields removed in recent refactors — always verify against current files before implementing a suggestion.
