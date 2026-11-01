# obsidian-shiki-plugin

House conventions for Obsidian plugin repos live in the `obsidian-plugin-dev` skill —
including upstream-sync procedure, obsidianmd registration, and settings-tab structure.
Only repo-specific facts are below.

Bundler is **vite**, not esbuild. Deploys to the vault folder `shiki-highlighter`.

## Upstream

Diverged too far (narrow host interfaces, `SettingsStore`, ec-core split) for a clean
`git merge upstream/master` — port fixes by hand.

Last reviewed: `5268557` (2026-10-27, upstream 0.8.0).

- `317babc` "maybe a fix for #89" (IME composition dispatch) — ported manually into
  `Cm6_ViewPlugin.ts`.
- `4bd464e` version bump — skipped, not applicable to the fork.
- `c0f585e` "migrate settings tab" — ported onto `SettingsStore`: declarative
  `getSettingDefinitions()` tab, folder pickers, edits schedule a debounced reload. Raises
  `minAppVersion` to 1.13.0.
- `4e855c4`, `2ac6dff`, `db4cca9`, `d7f9dc1` "fix lint issues part 1–4" — they also carried the
  `main.ts` reload rework. Ported: per-language processors re-synced after each reload
  (`CodeBlockProcessors.ts`), the tab refreshed after a reload, unload waiting for a
  reload still in flight (`RenderTargets.dispose`), and no duplicate excluded languages.
  Skipped: serialized reloads and the active-theme fallback (the fork already had both,
  in `RenderTargets` and `CustomAssets.modesToReset`), plus import-style and
  `window.requestAnimationFrame` lint nits.
- `38b2e6f`, `56c3d9c`, `1ffba9b`, `0560856`, `83231e7`, `6b0dc41` repo automation,
  CI and release tooling — skipped, the fork has its own toolchain.
- `5268557` version bump to 0.8.0 — skipped.

## Package structure

`ec-core/` runs at **both** Vite build time and plugin runtime, so shared code goes there,
not in `obsidian/`. It cannot import from `packages/obsidian/`. Build and runtime both create EC
through `createEcEngine` (`ec-core/src/EcEngine.ts`); CSS-variable placeholder encoding never
leaves it. `Settings` extends `EcSettingsProps` (`Config.ts`); the EC defaults live in
`EC_DEFAULT_SETTINGS`, which `DEFAULT_SETTINGS` spreads.

`[MIXED_EXPORTS]` on `bun run deploy` is benign — Obsidian's loader reads `module.default`
correctly.

## Narrow host interfaces

Modules take narrow interfaces defined in the consuming file, never `ShikiPlugin`. The
module that provides the behaviour satisfies them structurally, and `main.ts` passes it in:
`CodeHighlighter` for rendering, `RenderTargets` for registration (`RenderTargetRegistry`),
`SettingsStore` for settings the module reads itself (`Cm6Settings`). Do not add delegation
methods to `ShikiPlugin` for this. `ShikiPlugin` stands in only for what nothing else
provides: `HighlighterHost` (vault, notices, dark mode, settings flush) and the `Plugin`
argument of `SettingsTab`'s `super()`.
The rule is structural, not stylistic: `main.ts` already imports `CodeBlock.ts`,
`InlineCodeBlock.ts`, `Cm6_ViewPlugin.ts`, and `Highlighter.ts`, so importing `ShikiPlugin`'s
type back would create a cycle. Follow the pattern for new modules.

Exceptions and traps:

- `SettingsTab` extends `PluginSettingTab`, whose constructor requires `(App, Plugin)`. It
  takes the plugin for `super()` only; everything else arrives through its own narrow
  interfaces (`SettingsTabStore`, `ThemeLanguageSource`, `ReloadScheduler`), so the tab
  is registered after the highlighter and `RenderTargets` exist.
- `HighlighterHost` settings are opt-in: adding a field to `Settings` does **not** expose it
  to `CodeHighlighter`. Add its key to the `HighlighterSettings` `Pick` in `Highlighter.ts`;
  `main.ts` exposes the whole snapshot as `engineSettings`, so nothing else changes.

## Settings store

`SettingsStore` keeps `_persisted` (disk) and `_snapshot` (the engine's view, flushed on
reload by `CodeHighlighter.reload()`). Callers never choose live versus reload: user edits go
through `store.update(key, value)`, which writes the snapshot immediately only for keys in
`LIVE_SETTINGS` (`Settings.ts`), and resolves to whether the edit needs a reload. The
settings tab schedules a reload on `true`, so it never checks `LIVE_SETTINGS` itself. A new
live-effect setting is one entry in that set.
`store.reset(key)` writes the default to both, for a stored value found invalid mid-load
(`resetTheme`).

## Highlighter structure

`CodeHighlighter` (`Highlighter.ts`) is a lifecycle facade over `EcRenderer` (EC/fenced
blocks) and `ShikiRenderer` (Shiki/inline/CM6); `RenderTargets` owns the reload fan-out.
Prefer `reload()` for settings-driven reloads — it flushes the settings snapshot itself.
Work that touches plugin-owned registrations after a reload (processor sync, tab refresh) goes in
`RenderTargetsHost.afterReload`, which is skipped once disposed. Chained inside `reloadHighlighter`,
it ran after unload and leaked 347 processors into Obsidian until restart.

Design decisions that look arbitrary are recorded in `docs/adr/`. Architecture Explore
reports are hypotheses (removed methods, bugs that don't exist): verify against current
files and library source before acting.

## Dependencies

`package.json` pins `@codemirror/state`/`@codemirror/view` in both `overrides` and
`resolutions` to force a single copy (avoids a duplicate nested under
`@codemirror/language`'s own `node_modules`, which causes a `SelectionRange`/private-field
tsc error rather than a clear "duplicate package" message). When bumping either package,
update these two pin fields to match, then `rm -rf node_modules && bun install` — a plain
`bun install` can report "no changes" while leaving the stale nested copy in place.
