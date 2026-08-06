# Graph Report - obsidian-shiki-plugin  (2026-08-06)

## Corpus Check
- 41 files · ~18,221 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 578 nodes · 707 edges · 113 communities (43 shown, 70 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4c1dbb60`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Plugin Entry & Init
- Theme & Render Core
- Plugin Settings Management
- Architecture & Integration Patterns
- Config Models & Schemas
- Code Highlighter Core
- Code Block Life Cycle
- Inline Code Block Renderer
- CodeMirror 6 Custom Decorations
- Prism Syntax Integration
- Expressive Code Feature Demo
- Shiki Highlight Demo
- Obsidian API Extensions
- ESLint Configuration
- Vite Build Setup
- Inline Code Patterns
- Highlightable Ranges
- Decoration Builders
- ESLint Utility Functions
- Obsidian App Types
- SHIKI_INLINE_REGEX
- Cm6_RangeParser.ts
- obsidian-shiki-plugin
- defineConfig
- obsidian-ex.d.ts
- manifest.json
- devDependencies
- 0
- block-definition
- case-clause
- parameters
- .prettierrc.json
- odin.json
- file-tags
- import-declaration
- map-bitset
- object-definition
- return-type-declaration
- slice
- distinct-type-assignment
- block-label
- constant-assignment
- 0
- punctuation
- type-name
- variable-name
- vite-virtual-modules.d.ts
- @codemirror/language
- @codemirror/state
- @codemirror/view
- @eslint/js
- eslint-plugin-no-relative-import-paths
- eslint-plugin-obsidianmd
- eslint-plugin-only-warn
- assignments
- basic-types
- @expressive-code/core
- @expressive-code/plugin-collapsible-sections
- @expressive-code/plugin-frames
- @expressive-code/plugin-line-numbers
- @expressive-code/plugin-shiki
- @expressive-code/plugin-text-markers
- @happy-dom/global-registrator
- hast-util-to-dom
- itertools-ts
- @lemons_dev/lemons-obsidian-plugin-automation
- obsidian
- prettier
- shiki
- tslib
- @types/bun
- @types/prismjs
- typescript
- typescript-eslint
- vite-plugin-banner
- vite-plugin-node-polyfills
- vite-plugin-static-copy
- SettingsStore Management
- code:css (input:is([data-task="式"], [data-task="式"] > *):checked::afte)
- code:bash (echo "Hello")
- code:diff (+ this line will be marked as inserted)
- code:custom-odin (package main)
- code:cpp (#include <foo>)
- code:SQL (SELECT)
- Vault Index Note
- code:c (int a = 0;)
- code:block3 (- nested list)
- List Testing Note
- code:rs (pub fn add(a: usize, b: usize) -> usize {)
- Slides Presentation
- Untitled Vault Note
- code:`md
- code:block11
- code:`md
- code:block3
- code:`md
- code:block5
- code:`md
- code:block7
- code:block9
- OBSIDIAN_THEME_IDENTIFIER
- LANGUAGE_BLACKLIST
- FrameType
- Plugin README

## God Nodes (most connected - your core abstractions)
1. `ShikiPlugin` - 39 edges
2. `repository` - 35 edges
3. `compilerOptions` - 22 edges
4. `CodeHighlighter` - 19 edges
5. `scripts` - 14 edges
6. `CodeBlock` - 14 edges
7. `InlineCodeBlock` - 12 edges
8. `ThemeMapper` - 12 edges
9. `0` - 10 edges
10. `ShikiRenderer` - 10 edges

## Surprising Connections (you probably didn't know these)
- `expressiveCodeBundlePlugin()` --calls--> `createEcEngineConfig`  [EXTRACTED]
  vite.config.mts → packages/ec-core/src/Config.ts
- `expressiveCodeBundlePlugin()` --calls--> `encodeCssVarTheme`  [EXTRACTED]
  vite.config.mts → packages/ec-core/src/CssVarThemeAdapter.ts
- `HighlighterHost` --references--> `EcSettingsProps`  [EXTRACTED]
  packages/obsidian/src/Highlighter.ts → packages/ec-core/src/Config.ts
- `createEcEngineConfig` --calls--> `getECTheme`  [EXTRACTED]
  packages/ec-core/src/Config.ts → packages/ec-core/src/ECTheme.ts
- `ShikiPlugin` --references--> `CodeBlock`  [EXTRACTED]
  packages/obsidian/src/main.ts → packages/obsidian/src/CodeBlock.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plugin Configuration Flow** — packages_obsidian_src_settings_settings, packages_obsidian_src_settings_settings_default_settings, packages_obsidian_src_settings_settingsstore_settingsstore, packages_ec_core_src_config_ecsettingsprops, packages_ec_core_src_config_createecengineconfig [INFERRED 0.85]
- **Theme Resolution System** — packages_ec_core_src_obsidiantheme_obsidian_theme, packages_obsidian_src_themes_thememapper_thememapper, packages_obsidian_src_themes_thememapper_themecontext, packages_obsidian_src_constants_obsidian_theme_identifier [INFERRED 0.85]
- **Narrow Host Interfaces Pattern** — packages_obsidian_src_codemirror_cm6_viewplugin_cm6viewpluginhost, packages_obsidian_src_codeblock_codeblockhost, packages_obsidian_src_inlinecodeblock_inlinecodeblockhost, packages_obsidian_src_highlighter_highlighterhost [EXTRACTED 1.00]
- **Obsidian Rendering Integration** — packages_obsidian_src_codeblock_codeblock, packages_obsidian_src_inlinecodeblock_inlinecodeblock, packages_obsidian_src_codemirror_cm6_viewplugin_createcm6plugin [INFERRED 0.95]
- **Expressive Code Rendering Features** — exampleimage_custom_title, exampleimage_line_numbers, exampleimage_line_highlighting, exampleimage_diff_highlighting [EXTRACTED 1.00]

## Communities (113 total, 70 thin omitted)

### Community 0 - "Plugin Entry & Init"
Cohesion: 0.06
Nodes (6): createCm6Plugin, CustomTheme, InlineCodeBlock, InlineCodeBlockHost, ShikiPlugin, ShikiSettingsTab

### Community 1 - "Theme & Render Core"
Cohesion: 0.09
Nodes (17): EcConfigInput, EcSettingsProps, FrameType, getECTheme, add(), addSelector(), filterHighlightAllPlugin, PrismBeforeAllElementsHighlightEnv (+9 more)

### Community 2 - "Plugin Settings Management"
Cohesion: 0.12
Nodes (11): createEcEngineConfig, EC_VIRTUAL_SETTINGS, encodeCssVarTheme, EcRenderer, LANGUAGE_SPECIAL, ShikiRenderer, ThemeContext, ThemeMapper (+3 more)

### Community 4 - "Config Models & Schemas"
Cohesion: 0.12
Nodes (15): BRAT, Code Block Configuration, Comparison, Credits, Custom Themes, Diff Highlighting, Inline Highlighting, Installation (+7 more)

### Community 6 - "Code Block Life Cycle"
Cohesion: 0.14
Nodes (3): CodeHighlighter, HighlighterHost, LANGUAGE_DENYLIST

### Community 9 - "CodeMirror 6 Custom Decorations"
Cohesion: 0.07
Nodes (37): name, name, name, name, 1, 2, 3, 4 (+29 more)

### Community 11 - "Expressive Code Feature Demo"
Cohesion: 0.06
Nodes (32): bun, DOM, ESNext, ./packages/*, packages/*/src/**/*.d.ts, packages/*/src/**/*.ts, tests/**/*.ts, vite/client (+24 more)

### Community 13 - "Shiki Highlight Demo"
Cohesion: 0.40
Nodes (6): CSS Custom Task List Icons, Custom Code Block Title, Diff Highlighting, Line Highlighting, Line Numbering, Expressive Code Feature Demonstration Screenshot

### Community 18 - "Highlightable Ranges"
Cohesion: 0.07
Nodes (27): author, description, keywords, license, main, name, overrides, @codemirror/state (+19 more)

### Community 20 - "ESLint Utility Functions"
Cohesion: 0.10
Nodes (20): patterns, patterns, patterns, patterns, patterns, repository, attribute, comments (+12 more)

### Community 21 - "Obsidian App Types"
Cohesion: 0.18
Nodes (13): name, name, 1, 2, captures, match, captures, match (+5 more)

### Community 23 - "Cm6_RangeParser.ts"
Cohesion: 0.17
Nodes (9): buildDecorationSet, HighlightableRange, checkSelectionOverlap(), parseFencedRanges(), ParseFencedRangesOptions, SelectionRange, WalkedEntry, Cm6ViewPluginHost (+1 more)

### Community 24 - "obsidian-shiki-plugin"
Cohesion: 0.18
Nodes (10): ec-core constraint, ESLint, Highlighter structure, Known build warnings, Narrow host interfaces, obsidian-shiki-plugin, Package structure, Settings (+2 more)

### Community 27 - "manifest.json"
Cohesion: 0.20
Nodes (9): author, authorUrl, description, fundingUrl, id, isDesktopOnly, minAppVersion, name (+1 more)

### Community 28 - "devDependencies"
Cohesion: 0.22
Nodes (9): eslint-plugin-import-x, @lezer/common, devDependencies, eslint-plugin-import-x, @lezer/common, @tsconfig/svelte, vite, @tsconfig/svelte (+1 more)

### Community 29 - "0"
Cohesion: 0.22
Nodes (9): name, begin, end, endCaptures, name, patterns, 0, block-comment (+1 more)

### Community 30 - "block-definition"
Cohesion: 0.29
Nodes (7): begin, beginCaptures, end, endCaptures, name, patterns, block-definition

### Community 31 - "case-clause"
Cohesion: 0.29
Nodes (7): begin, beginCaptures, end, endCaptures, name, patterns, case-clause

### Community 32 - "parameters"
Cohesion: 0.29
Nodes (7): begin, beginCaptures, end, endCaptures, name, patterns, parameters

### Community 33 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): arrowParens, printWidth, semi, singleQuote, tabWidth, useTabs

### Community 34 - "odin.json"
Cohesion: 0.33
Nodes (5): comment, name, patterns, $schema, scopeName

### Community 35 - "file-tags"
Cohesion: 0.33
Nodes (6): begin, beginCaptures, end, name, patterns, file-tags

### Community 36 - "import-declaration"
Cohesion: 0.33
Nodes (6): begin, beginCaptures, end, name, patterns, import-declaration

### Community 37 - "map-bitset"
Cohesion: 0.33
Nodes (6): begin, beginCaptures, end, endCaptures, patterns, map-bitset

### Community 38 - "object-definition"
Cohesion: 0.33
Nodes (6): begin, end, endCaptures, name, patterns, object-definition

### Community 39 - "return-type-declaration"
Cohesion: 0.33
Nodes (6): return-type-declaration, begin, beginCaptures, end, name, patterns

### Community 40 - "slice"
Cohesion: 0.33
Nodes (6): slice, begin, beginCaptures, end, name, patterns

### Community 41 - "distinct-type-assignment"
Cohesion: 0.40
Nodes (5): begin, end, name, patterns, distinct-type-assignment

### Community 42 - "block-label"
Cohesion: 0.50
Nodes (4): captures, match, name, block-label

### Community 43 - "constant-assignment"
Cohesion: 0.50
Nodes (4): captures, match, name, constant-assignment

### Community 44 - "0"
Cohesion: 0.67
Nodes (3): 0, beginCaptures, beginCaptures

### Community 45 - "punctuation"
Cohesion: 0.67
Nodes (3): match, name, punctuation

### Community 46 - "type-name"
Cohesion: 0.67
Nodes (3): type-name, match, name

### Community 47 - "variable-name"
Cohesion: 0.67
Nodes (3): variable-name, match, name

## Knowledge Gaps
- **251 isolated node(s):** `printWidth`, `useTabs`, `tabWidth`, `semi`, `singleQuote` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **70 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `repository` connect `ESLint Utility Functions` to `CodeMirror 6 Custom Decorations`, `Obsidian App Types`, `0`, `block-definition`, `case-clause`, `parameters`, `odin.json`, `file-tags`, `import-declaration`, `map-bitset`, `object-definition`, `return-type-declaration`, `slice`, `distinct-type-assignment`, `block-label`, `constant-assignment`, `punctuation`, `type-name`, `variable-name`, `assignments`, `basic-types`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `ShikiPlugin` connect `Plugin Entry & Init` to `Theme & Render Core`, `Code Block Life Cycle`, `Inline Code Block Renderer`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `CodeHighlighter` connect `Code Block Life Cycle` to `Plugin Entry & Init`, `Theme & Render Core`, `Plugin Settings Management`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `printWidth`, `useTabs`, `tabWidth` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Plugin Entry & Init` be split into smaller, more focused modules?**
  _Cohesion score 0.05612244897959184 - nodes in this community are weakly interconnected._
- **Should `Theme & Render Core` be split into smaller, more focused modules?**
  _Cohesion score 0.08961593172119488 - nodes in this community are weakly interconnected._
- **Should `Plugin Settings Management` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._