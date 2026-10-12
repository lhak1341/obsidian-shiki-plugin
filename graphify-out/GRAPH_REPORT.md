# Graph Report - obsidian-shiki-plugin  (2026-10-12)

## Corpus Check
- 49 files · ~19,795 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 609 nodes · 778 edges · 111 communities (43 shown, 68 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9fb884e4`
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
- code:block7
- code:block9
- OBSIDIAN_THEME_IDENTIFIER
- LANGUAGE_BLACKLIST
- FrameType
- Plugin README

## God Nodes (most connected - your core abstractions)
1. `repository` - 35 edges
2. `compilerOptions` - 22 edges
3. `ShikiPlugin` - 18 edges
4. `CodeHighlighter` - 17 edges
5. `Settings` - 16 edges
6. `scripts` - 14 edges
7. `createEcEngine()` - 11 edges
8. `0` - 10 edges
9. `CodeBlock` - 10 edges
10. `RenderTargetRegistry` - 10 edges

## Surprising Connections (you probably didn't know these)
- `expressiveCodeBundlePlugin()` --calls--> `createEcEngine()`  [EXTRACTED]
  vite.config.mts → packages/ec-core/src/EcEngine.ts
- `Cm6Settings` --references--> `Settings`  [EXTRACTED]
  packages/obsidian/src/codemirror/Cm6_ViewPlugin.ts → packages/obsidian/src/settings/Settings.ts
- `EcEngineInput` --references--> `EcSettingsProps`  [EXTRACTED]
  packages/ec-core/src/EcEngine.ts → packages/ec-core/src/Config.ts
- `Settings` --inherits--> `EcSettingsProps`  [EXTRACTED]
  packages/obsidian/src/settings/Settings.ts → packages/ec-core/src/Config.ts
- `CodeHighlighter` --references--> `EcRenderer`  [EXTRACTED]
  packages/obsidian/src/Highlighter.ts → packages/obsidian/src/EcRenderer.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Obsidian Rendering Integration** — packages_obsidian_src_codeblock_codeblock, packages_obsidian_src_inlinecodeblock_inlinecodeblock, packages_obsidian_src_codemirror_cm6_viewplugin_createcm6plugin [INFERRED 0.95]
- **Expressive Code Rendering Features** — exampleimage_custom_title, exampleimage_line_numbers, exampleimage_line_highlighting, exampleimage_diff_highlighting [EXTRACTED 1.00]

## Communities (111 total, 68 thin omitted)

### Community 0 - "Plugin Entry & Init"
Cohesion: 0.22
Nodes (3): RenderTarget, RenderTargets, RenderTargetsHost

### Community 1 - "Theme & Render Core"
Cohesion: 0.06
Nodes (20): FrameType, createCm6Plugin(), ShikiPlugin, add(), addSelector(), filterHighlightAllPlugin(), PrismBeforeAllElementsHighlightEnv, PrismFilterHighlightApi (+12 more)

### Community 2 - "Plugin Settings Management"
Cohesion: 0.08
Nodes (18): CustomAssets, CustomAssetsHost, CustomAssetsInput, CustomTheme, listJsonFiles(), loadCustomAssets(), loadLanguages(), loadThemes() (+10 more)

### Community 4 - "Config Models & Schemas"
Cohesion: 0.12
Nodes (15): BRAT, Code Block Configuration, Comparison, Credits, Custom Themes, Diff Highlighting, Inline Highlighting, Installation (+7 more)

### Community 6 - "Code Block Life Cycle"
Cohesion: 0.13
Nodes (14): EC_DEFAULT_SETTINGS, EcSettingsProps, encodeCssVarTheme(), createEcEngine(), createEcEngineConfig(), EcEngine, EcEngineInput, EcThemeInput (+6 more)

### Community 7 - "Inline Code Block Renderer"
Cohesion: 0.12
Nodes (8): CodeBlock, CodeBlockRenderer, FenceMetaReader, FenceMetaReaderDeps, FenceSectionInfo, InlineCodeBlock, InlineCodeRenderer, RenderTargetRegistry

### Community 9 - "CodeMirror 6 Custom Decorations"
Cohesion: 0.05
Nodes (47): name, name, name, name, name, 1, 2, 3 (+39 more)

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
Cohesion: 0.09
Nodes (22): patterns, patterns, patterns, patterns, patterns, patterns, match, name (+14 more)

### Community 21 - "Obsidian App Types"
Cohesion: 0.15
Nodes (17): name, captures, 1, 2, captures, match, name, captures (+9 more)

### Community 23 - "Cm6_RangeParser.ts"
Cohesion: 0.15
Nodes (17): buildDecorationSet(), HighlightableRange, DecorationSets, PipelineDeps, PipelineInput, rebuildDecorations(), RebuildResult, checkSelectionOverlap() (+9 more)

### Community 24 - "obsidian-shiki-plugin"
Cohesion: 0.25
Nodes (7): Dependencies, Highlighter structure, Narrow host interfaces, obsidian-shiki-plugin, Package structure, Settings store, Upstream

### Community 27 - "manifest.json"
Cohesion: 0.40
Nodes (3): OPTIONAL, REQUIRED, targets

### Community 28 - "devDependencies"
Cohesion: 0.22
Nodes (9): @codemirror/language, @lezer/common, devDependencies, @codemirror/language, @lezer/common, @tsconfig/svelte, vite, @tsconfig/svelte (+1 more)

### Community 29 - "0"
Cohesion: 0.33
Nodes (6): begin, beginCaptures, end, name, patterns, block-comment

### Community 30 - "block-definition"
Cohesion: 0.33
Nodes (6): begin, end, endCaptures, name, patterns, block-definition

### Community 31 - "case-clause"
Cohesion: 0.20
Nodes (9): author, authorUrl, description, fundingUrl, id, isDesktopOnly, minAppVersion, name (+1 more)

### Community 32 - "parameters"
Cohesion: 0.33
Nodes (6): begin, end, endCaptures, name, patterns, parameters

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
Nodes (6): begin, beginCaptures, end, name, patterns, object-definition

### Community 39 - "return-type-declaration"
Cohesion: 0.33
Nodes (6): return-type-declaration, begin, beginCaptures, end, name, patterns

### Community 40 - "slice"
Cohesion: 0.33
Nodes (6): slice, begin, end, endCaptures, name, patterns

### Community 41 - "distinct-type-assignment"
Cohesion: 0.50
Nodes (4): name, endCaptures, 0, endCaptures

### Community 42 - "block-label"
Cohesion: 0.67
Nodes (3): match, name, block-label

### Community 43 - "constant-assignment"
Cohesion: 0.67
Nodes (3): type-declaration, name, patterns

### Community 44 - "0"
Cohesion: 0.50
Nodes (4): 0, beginCaptures, beginCaptures, beginCaptures

### Community 45 - "punctuation"
Cohesion: 0.67
Nodes (3): variable-assignment, match, name

### Community 46 - "type-name"
Cohesion: 0.67
Nodes (3): type-name, match, name

### Community 47 - "variable-name"
Cohesion: 0.67
Nodes (3): variable-name, match, name

## Knowledge Gaps
- **254 isolated node(s):** `printWidth`, `useTabs`, `tabWidth`, `semi`, `singleQuote` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **68 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `repository` connect `ESLint Utility Functions` to `parameters`, `odin.json`, `file-tags`, `import-declaration`, `map-bitset`, `object-definition`, `code:`md`, `return-type-declaration`, `CodeMirror 6 Custom Decorations`, `block-label`, `slice`, `constant-assignment`, `punctuation`, `type-name`, `variable-name`, `Obsidian App Types`, `0`, `block-definition`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `Highlightable Ranges`, `@codemirror/language`, `@codemirror/view`, `@eslint/js`, `eslint-plugin-no-relative-import-paths`, `eslint-plugin-obsidianmd`, `eslint-plugin-only-warn`, `assignments`, `@expressive-code/core`, `@expressive-code/plugin-collapsible-sections`, `@expressive-code/plugin-frames`, `@expressive-code/plugin-line-numbers`, `@expressive-code/plugin-shiki`, `@expressive-code/plugin-text-markers`, `@happy-dom/global-registrator`, `hast-util-to-dom`, `itertools-ts`, `@lemons_dev/lemons-obsidian-plugin-automation`, `obsidian`, `prettier`, `shiki`, `tslib`, `@types/bun`, `@types/prismjs`, `typescript`, `typescript-eslint`, `vite-plugin-banner`, `vite-plugin-node-polyfills`, `vite-plugin-static-copy`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `CodeHighlighter` connect `Plugin Settings Management` to `Theme & Render Core`, `Code Block Life Cycle`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `printWidth`, `useTabs`, `tabWidth` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Theme & Render Core` be split into smaller, more focused modules?**
  _Cohesion score 0.056866303690260134 - nodes in this community are weakly interconnected._
- **Should `Plugin Settings Management` be split into smaller, more focused modules?**
  _Cohesion score 0.07536231884057971 - nodes in this community are weakly interconnected._
- **Should `Config Models & Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._