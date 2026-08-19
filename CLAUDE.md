# obsidian-shiki-plugin

Fork of `mProjectsCode/obsidian-shiki-plugin`. Upstream remote:
https://github.com/mProjectsCode/obsidian-shiki-plugin.git

House conventions for Obsidian plugin repos live in the `obsidian-plugin-dev` skill —
including upstream-sync procedure, obsidianmd registration, and settings-tab structure.
Only repo-specific facts are below.

Has `graphify-out/`. Bundler is **vite**, not esbuild. Test runner is bun's native one.
Deploys to the vault folder `shiki-highlighter`.

## Upstream

Diverged too far (narrow host interfaces, `SettingsStore`, ec-core split) for a clean
`git merge upstream/master` — port fixes by hand.

Last reviewed: `4bd464e` (2026-08-02, canary version bump).
- `317babc` "maybe a fix for #89" (IME composition dispatch) — ported manually into
  `Cm6_ViewPlugin.ts`.
- `4bd464e` version bump — skipped, not applicable to the fork.

## ESLint

`eslint-plugin-obsidianmd` is registered manually because spreading
`obsidianmd.configs.recommended` conflicts with this project's `eslint-plugin-import-x`,
also registered as `import`.

## Package structure

`ec-core/` runs at **both** Vite build time and plugin runtime, so shared code goes there,
not in `obsidian/`. It cannot import from `packages/obsidian/`. `EcSettingsProps`
(`Config.ts`) is a parallel interface to `Settings`, and
`void (DEFAULT_SETTINGS satisfies EcSettingsProps)` in `Settings.ts` enforces compatibility
at compile time — apply `satisfies` to the declared variable, not the object literal
(excess-property checking fires on literals).

`[MIXED_EXPORTS]` on `bun run deploy` is benign — Obsidian's loader reads `module.default`
correctly.

## Narrow host interfaces

Modules take a narrow host interface defined in the consuming file, not `ShikiPlugin`;
`ShikiPlugin` satisfies them structurally via thin delegation methods in `main.ts`. This is
structural, not stylistic: `main.ts` already imports `CodeBlock.ts`, `InlineCodeBlock.ts`,
`Cm6_ViewPlugin.ts`, and `Highlighter.ts`, so importing `ShikiPlugin`'s type back would
create a cycle. Follow the pattern for new modules.

Exceptions and traps:
- `SettingsTab` extends `PluginSettingTab`, whose constructor requires `(App, Plugin)` — it
  cannot be fully narrowed and accesses `plugin.store` directly.
- `HighlighterHost` fields are opt-in: adding a field to `Settings` does **not** expose it
  to `CodeHighlighter`. Add it to `HighlighterHost` (`Highlighter.ts`) and satisfy it in
  `main.ts`.

## Settings store

`SettingsStore` (`settings/SettingsStore.ts`) owns two layers: `_persisted` (disk) and
`_snapshot` (the engine's active view, flushed on reload). Use `store.set(key, value)` for
reload-required settings and `store.setLive(key, value)` for live-effect ones (writes both
immediately). `CodeHighlighter.reload()` internalizes the flush invariant — it calls
`host.refreshSettings()` (delegating to `store.flush()`) between `unload()` and `load()`,
so callers cannot forget it. `plugin.settings` and `plugin.loadedSettings` no longer exist.

## Highlighter structure

`CodeHighlighter` (`Highlighter.ts`) is a lifecycle facade: it owns custom theme/language
loading, `ThemeMapper` construction, and `obsidianSafeLanguageNames()`, delegating
rendering to `EcRenderer` (EC/fenced blocks) and `ShikiRenderer` (Shiki/inline/CM6). Public
lifecycle API: `load()`, `unload()`, `reload()` — prefer `reload()` for settings-driven
reloads.

## Testing

- `tests/happydom.ts` polyfills Obsidian globals (`createDiv`, `sleep`,
  `HTMLElement.prototype.empty`); new module stubs go in `tests/obsidianMock.ts`.
- `@codemirror/state` types are bun-testable without a DOM. `EditorView` needs integration
  tests, but `Decoration.*` from `@codemirror/view` is HappyDOM-testable — see
  `Cm6_DecorationBuilder.test.ts`.
- Obsidian's HyperMD parser (which produces `HyperMD-codeblock-*` nodes) ships inside the
  app, not as a package, so `syntaxTree()`-walking code cannot be tested against a real
  tree. Shape such logic to consume pre-walked plain data, keeping the walk (mechanical,
  untestable) separate from the classification (testable) — see `Cm6_RangeParser.ts`.
- Pick shiki theme names dynamically in tests (`Object.keys(bundledThemes)[0]`) — a
  hardcoded name breaks silently on a shiki upgrade. See `ThemeMapper.test.ts`.

Architecture Explore reports may describe methods or fields removed in recent refactors —
verify against current files before implementing a suggestion.

## Dependencies

`package.json` pins `@codemirror/state`/`@codemirror/view` in both `overrides` and
`resolutions` to force a single copy (avoids a duplicate nested under
`@codemirror/language`'s own `node_modules`, which causes a `SelectionRange`/private-field
tsc error rather than a clear "duplicate package" message). When bumping either package,
update these two pin fields to match, then `rm -rf node_modules && bun install` — a plain
`bun install` can report "no changes" while leaving the stale nested copy in place.
