# Graph Report - obsidian-shiki-plugin  (2026-07-03)

## Corpus Check
- 24 files · ~13,501 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 183 nodes · 230 edges · 23 communities (16 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0aadbd80`
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

## God Nodes (most connected - your core abstractions)
1. `CodeHighlighter` - 18 edges
2. `ShikiPlugin` - 13 edges
3. `ThemeMapper` - 11 edges
4. `CodeBlock` - 9 edges
5. `InlineCodeBlock` - 8 edges
6. `Shiki Highlighter` - 7 edges
7. `Code Block Configuration` - 7 edges
8. `StringSelectModal` - 6 edges
9. `Cm6_Util` - 6 edges
10. `obsidian-shiki-plugin` - 5 edges

## Surprising Connections (you probably didn't know these)
- `createEcEngineConfig()` --calls--> `getECTheme()`  [EXTRACTED]
  packages/ec-core/src/Config.ts → packages/ec-core/src/ECTheme.ts

## Communities (23 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (10): DEFAULT_SETTINGS, FrameType, Settings, ShikiSettingsTab, StringSelectModal, PrismBeforeAllElementsHighlightEnv, PrismFilterHighlightApi, PrismFilterHighlightCondition (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (11): createEcEngineConfig(), CssVariableThemeBundle, EC_VIRTUAL_SETTINGS, EcConfigInput, EcSettingsProps, encodeCssVarTheme(), getECTheme(), CustomTheme (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (3): createCm6Plugin(), ShikiPlugin, filterHighlightAllPlugin()

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): Code Block Configuration, code:`md, code:block11, code:`md, code:block3, code:`md, code:block5, code:`md (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): API usage, code:ts (function test(): Promise<string | null> {), code:ts (async function AsyncTest(): Promise<string | null> {), code:ts (import { normalizePath } from 'obsidian';), code:ts (this.app.vault.getFiles().find(file => file.path === filePat), code:ts (// if you want to get a file), Coding style, Compatibility (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (11): BRAT, code:md (Some inline code `{jsx} <button role="button" />`.), Comparison, Credits, Custom Themes, Inline Highlighting, Installation, License (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (5): Cm6_Util, DecorationUpdate, DecorationUpdateType, InsertDecoration, RemoveDecoration

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): code:ts (export class Parser<const SType extends STypeBase> {), code:css (input:is([data-task="式"], [data-task="式"] > *):checked::afte), code:css (input:is([data-task="式"], [data-task="式"] > *):checked::afte), code:bash (echo "Hello"), code:diff (+ this line will be marked as inserted), code:custom-odin (package main), code:cpp (#include <foo>), code:SQL (SELECT)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (5): ESLint, Known build warnings, obsidian-shiki-plugin, Package structure, Settings invariant

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (3): code:block1 (- list), code:c (int a = 0;), code:block3 (- nested list)

## Knowledge Gaps
- **60 isolated node(s):** `PrismFilterHighlightEnv`, `PrismFilterHighlightCondition`, `PrismFilterHighlightApi`, `PrismBeforeAllElementsHighlightEnv`, `CustomTheme` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CodeHighlighter` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `ShikiPlugin` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `ThemeMapper` connect `Community 8` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `PrismFilterHighlightEnv`, `PrismFilterHighlightCondition`, `PrismFilterHighlightApi` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._