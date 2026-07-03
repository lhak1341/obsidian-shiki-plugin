# Graph Report - obsidian-shiki-plugin  (2026-07-03)

## Corpus Check
- 28 files · ~13,736 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 234 nodes · 309 edges · 25 communities (17 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `400dd39d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `ShikiPlugin` - 27 edges
2. `CodeHighlighter` - 19 edges
3. `ThemeMapper` - 13 edges
4. `obsidian-shiki-plugin` - 10 edges
5. `CodeBlock` - 9 edges
6. `ShikiRenderer` - 8 edges
7. `InlineCodeBlock` - 8 edges
8. `SettingsStore` - 8 edges
9. `Shiki Highlighter` - 7 edges
10. `Code Block Configuration` - 7 edges

## Surprising Connections (you probably didn't know these)
- `createEcEngineConfig()` --calls--> `getECTheme()`  [EXTRACTED]
  packages/ec-core/src/Config.ts → packages/ec-core/src/ECTheme.ts

## Communities (25 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (3): createCm6Plugin(), ShikiPlugin, filterHighlightAllPlugin()

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (6): DEFAULT_SETTINGS, FrameType, Settings, SettingsStore, ShikiSettingsTab, StringSelectModal

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (13): createEcEngineConfig(), CssVariableThemeBundle, EC_VIRTUAL_SETTINGS, EcConfigInput, EcSettingsProps, encodeCssVarTheme(), EcRenderer, getECTheme() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (8): buildDecorationSet(), HighlightableRange, Cm6_Util, Cm6ViewPluginHost, DecorationUpdate, DecorationUpdateType, InsertDecoration, RemoveDecoration

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (15): Code Block Configuration, code:`md, code:block11, code:`md, code:block3, code:`md, code:block5, code:`md (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (13): API usage, code:ts (function test(): Promise<string | null> {), code:ts (async function AsyncTest(): Promise<string | null> {), code:ts (import { normalizePath } from 'obsidian';), code:ts (this.app.vault.getFiles().find(file => file.path === filePat), code:ts (// if you want to get a file), Coding style, Compatibility (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (11): BRAT, code:md (Some inline code `{jsx} <button role="button" />`.), Comparison, Credits, Custom Themes, Inline Highlighting, Installation, License (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (10): ec-core constraint, ESLint, Highlighter structure, Known build warnings, Narrow host interfaces, obsidian-shiki-plugin, Package structure, Settings (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (8): code:ts (export class Parser<const SType extends STypeBase> {), code:css (input:is([data-task="式"], [data-task="式"] > *):checked::afte), code:css (input:is([data-task="式"], [data-task="式"] > *):checked::afte), code:bash (echo "Hello"), code:diff (+ this line will be marked as inserted), code:custom-odin (package main), code:cpp (#include <foo>), code:SQL (SELECT)

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (5): PrismBeforeAllElementsHighlightEnv, PrismFilterHighlightApi, PrismFilterHighlightCondition, PrismFilterHighlightEnv, PrismWithFilterHighlightAll

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (3): code:block1 (- list), code:c (int a = 0;), code:block3 (- nested list)

## Knowledge Gaps
- **69 isolated node(s):** `LANGUAGE_SPECIAL`, `CodeBlockHost`, `PrismFilterHighlightEnv`, `PrismFilterHighlightCondition`, `PrismFilterHighlightApi` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ShikiPlugin` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `CodeHighlighter` connect `Community 3` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `ThemeMapper` connect `Community 10` to `Community 1`, `Community 2`, `Community 11`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `LANGUAGE_SPECIAL`, `CodeBlockHost`, `PrismFilterHighlightEnv` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._