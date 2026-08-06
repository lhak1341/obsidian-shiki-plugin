# obsidian-shiki-plugin

Fork of mProjectsCode/obsidian-shiki-plugin. Upstream remote: https://github.com/mProjectsCode/obsidian-shiki-plugin.git
Deploy to vault: `bun run deploy`

## Upstream sync

Fork has diverged too much (narrow host interfaces, SettingsStore, ec-core split) for clean `git merge upstream/master` — manually port relevant fixes instead: `git fetch upstream && git log HEAD..upstream/master --oneline`, review each commit, port real fixes by hand, skip noise (version bumps, canary tags).

Last upstream commit reviewed: `4bd464e` (2026-08-02, "bump version to 0.7.7-canary.20260802T134945").
- `317babc` "maybe a fix for #89" (IME composition dispatch bug) — ported manually into `Cm6_ViewPlugin.ts` (not merged, structure diverged).
- `4bd464e` version bump — skipped, not applicable to fork.

## ESLint

`eslint-plugin-obsidianmd` must be integrated manually (plugin object + rules in the existing config block) — spreading `obsidianmd.configs.recommended` conflicts with the project's `eslint-plugin-import-x` which is also registered as `import`.

## Known build warnings

`[MIXED_EXPORTS]` on `bun run deploy` is benign — Obsidian's loader reads `module.default` correctly.

## Package structure

`ec-core/` runs at both Vite build time and plugin runtime — put shared code there, not in `obsidian/`.

## Settings

`SettingsStore` (settings/SettingsStore.ts) owns both layers: `_persisted` (written to disk) and `_snapshot` (engine's active view, flushed on reload). Use `store.set(key, value)` for reload-required settings and `store.setLive(key, value)` for live-effect settings (writes both layers immediately). `CodeHighlighter.reload()` internalizes the flush invariant: it calls `host.refreshSettings()` (which delegates to `store.flush()`) between `unload()` and `load()` — callers of `reload()` cannot forget the flush. Do not access `plugin.settings` or `plugin.loadedSettings` directly — they no longer exist.

`SettingsTab` groups get padding only when wrapped: `containerEl.createDiv('setting-group').createDiv('setting-items')`, then pass that inner div (not `containerEl`) to `new Setting(...)`. Headings (`.setHeading()`) stay on `containerEl` directly, outside the wrapper.

## Testing

`tests/happydom.ts` polyfills Obsidian globals (`createDiv`, `sleep`, `HTMLElement.prototype.empty`); add new Obsidian module stubs to `tests/obsidianMock.ts`.
`@codemirror/state` types are bun-testable without DOM; `EditorView` requires integration tests, but `Decoration.*` from `@codemirror/view` is HappyDOM-testable — see `Cm6_DecorationBuilder.test.ts`.
Obsidian's HyperMD markdown parser (produces `HyperMD-codeblock-*` node types) is bundled in the app, not an installable package — code that walks `syntaxTree()` can't be unit-tested against a real parsed tree. Shape such logic to consume pre-walked plain-data entries instead, keeping only the walk itself (untestable, mechanical) separate from the classification logic (testable) — see `Cm6_RangeParser.ts`.
When testing against shiki's bundled themes, pick a theme name dynamically (`Object.keys(bundledThemes)[0]`) rather than hardcoding one — a hardcoded name breaks silently if a future shiki upgrade renames/removes it — see `ThemeMapper.test.ts`.

## Narrow host interfaces

Modules take a narrow host interface (defined in the consuming file) instead of `ShikiPlugin`; `ShikiPlugin` satisfies them structurally via thin delegation methods in `main.ts`. Follow this pattern for new modules. Exception: `SettingsTab` extends Obsidian's `PluginSettingTab` whose constructor requires `(App, Plugin)` — it cannot be fully narrowed; it accesses `plugin.store` directly instead. `HighlighterHost` settings fields are opt-in — adding a field to `Settings` does not expose it to `CodeHighlighter`; you must explicitly add it to `HighlighterHost` (Highlighter.ts) and satisfy it in `main.ts`.

This is structural, not just stylistic: `main.ts` already imports `CodeBlock.ts`/`InlineCodeBlock.ts`/`Cm6_ViewPlugin.ts`/`Highlighter.ts` — those modules importing `ShikiPlugin`'s type back to skip the narrow interface would create a circular import.

## Highlighter structure

`CodeHighlighter` (Highlighter.ts) is a lifecycle facade: owns custom theme/language loading, `ThemeMapper` construction, and `obsidianSafeLanguageNames()`. It delegates rendering to `EcRenderer` (EC/fenced blocks) and `ShikiRenderer` (Shiki/inline/CM6). Public lifecycle API: `load()`, `unload()`, `reload()` (preferred for settings-driven reloads — internalizes the flush ordering invariant).

## ec-core constraint

`ec-core/` cannot import from `packages/obsidian/` — it runs at Vite build time. `EcSettingsProps` in `Config.ts` is a parallel interface to `Settings`. `void (DEFAULT_SETTINGS satisfies EcSettingsProps)` in `Settings.ts` enforces compatibility at compile time — missing a field is a compile error. Apply `satisfies` to the declared variable, not the object literal (excess-property checking fires on literals).

Architecture Explore reports may describe methods or fields removed in recent refactors — always verify against current files before implementing a suggestion.
