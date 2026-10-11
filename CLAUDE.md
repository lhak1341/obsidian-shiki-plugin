# obsidian-shiki-plugin

House conventions for Obsidian plugin repos live in the `obsidian-plugin-dev` skill —
including upstream-sync procedure, obsidianmd registration, and settings-tab structure.
Only repo-specific facts are below.

Bundler is **vite**, not esbuild. Deploys to the vault folder `shiki-highlighter`.

## Upstream

Diverged too far (narrow host interfaces, `SettingsStore`, ec-core split) for a clean
`git merge upstream/master` — port fixes by hand.

Last reviewed: `4bd464e` (2026-08-02, canary version bump).

- `317babc` "maybe a fix for #89" (IME composition dispatch) — ported manually into
  `Cm6_ViewPlugin.ts`.
- `4bd464e` version bump — skipped, not applicable to the fork.

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
- `HighlighterHost` settings are opt-in: adding a field to `Settings` does **not** expose it
  to `CodeHighlighter`. Add its key to the `HighlighterSettings` `Pick` in `Highlighter.ts`;
  `main.ts` exposes the whole snapshot as `engineSettings`, so nothing else changes.

## Settings store

`SettingsStore` keeps `_persisted` (disk) and `_snapshot` (the engine's view, flushed on
reload by `CodeHighlighter.reload()`). Use `store.set(key, value)` for reload-required
settings and `store.setLive(key, value)` for live-effect ones (writes both immediately).

## Highlighter structure

`CodeHighlighter` (`Highlighter.ts`) is a lifecycle facade over `EcRenderer` (EC/fenced
blocks) and `ShikiRenderer` (Shiki/inline/CM6); `RenderTargets` owns the reload fan-out.
Prefer `reload()` for settings-driven reloads — it flushes the settings snapshot itself.

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
