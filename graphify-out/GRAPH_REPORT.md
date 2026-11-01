# Graph Report - obsidian-shiki-plugin  (2026-11-01)

## Corpus Check
- 50 files · ~20,583 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .lock 1, .toml 1)

## Summary
- 633 nodes · 908 edges · 87 communities (44 shown, 43 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5dc2efdc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ShikiPlugin
- Theme & Render Core
- Plugin Settings Management
- Architecture & Integration Patterns
- Config Models & Schemas
- EcEngine.ts
- EcRenderer.ts
- Inline Code Block Renderer
- vite.config.mts
- beginCaptures
- Prism Syntax Integration
- Expressive Code Feature Demo
- 1
- Shiki Highlight Demo
- Obsidian API Extensions
- ESLint Configuration
- Vite Build Setup
- Inline Code Patterns
- scripts
- Decoration Builders
- ESLint Utility Functions
- Obsidian App Types
- case-clause
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
- 0
- block-label
- constant-assignment
- distinct-type-assignment
- punctuation
- type-name
- procedure-assignment
- vite-virtual-modules.d.ts
- type-annotation
- type-assignment
- punctuation
- overrides
- resolutions
- name
- keywords
- statements
- package.json
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
- FrameType
- Plugin README

## God Nodes (most connected - your core abstractions)
1. `repository` - 35 edges
2. `compilerOptions` - 22 edges
3. `ShikiPlugin` - 21 edges
4. `CodeHighlighter` - 18 edges
5. `Settings` - 18 edges
6. `scripts` - 14 edges
7. `shiki` - 14 edges
8. `CodeBlock` - 12 edges
9. `ShikiSettingsTab` - 12 edges
10. `FenceMetaReader` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Domain glossary` --references--> `FenceMetaReader`  [INFERRED]
  CONTEXT.md → packages/obsidian/src/FenceMeta.ts
- `Keep the stale-render guards in each consumer` --references--> `CodeBlock`  [INFERRED]
  docs/adr/0001-keep-stale-render-guards-per-consumer.md → packages/obsidian/src/CodeBlock.ts
- `Keep the stale-render guards in each consumer` --references--> `InlineCodeBlock`  [INFERRED]
  docs/adr/0001-keep-stale-render-guards-per-consumer.md → packages/obsidian/src/InlineCodeBlock.ts
- `expressiveCodeBundlePlugin()` --calls--> `createEcEngine()`  [EXTRACTED]
  vite.config.mts → packages/ec-core/src/EcEngine.ts
- `EcEngineInput` --references--> `EcSettingsProps`  [EXTRACTED]
  packages/ec-core/src/EcEngine.ts → packages/ec-core/src/Config.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Obsidian Rendering Integration** — packages_obsidian_src_codeblock_codeblock, packages_obsidian_src_inlinecodeblock_inlinecodeblock, packages_obsidian_src_codemirror_cm6_viewplugin_createcm6plugin [INFERRED 0.95]
- **Expressive Code Rendering Features** — exampleimage_custom_title, exampleimage_line_numbers, exampleimage_line_highlighting, exampleimage_diff_highlighting [EXTRACTED 1.00]

## Communities (87 total, 43 thin omitted)

### Community 0 - "ShikiPlugin"
Cohesion: 0.06
Nodes (7): CodeBlockProcessors, ProcessorRegistrar, ShikiPlugin, filterHighlightAllPlugin(), RenderTarget, RenderTargets, RenderTargetsHost

### Community 1 - "Theme & Render Core"
Cohesion: 0.06
Nodes (24): EC_DEFAULT_SETTINGS, FrameType, Auto, Code, None, Terminal, Cm6Settings, OBSIDIAN_THEME_IDENTIFIER (+16 more)

### Community 2 - "Plugin Settings Management"
Cohesion: 0.07
Nodes (22): OBSIDIAN_THEME, CustomAssets, CustomAssetsHost, CustomAssetsInput, CustomTheme, listJsonFiles(), loadCustomAssets(), loadLanguages() (+14 more)

### Community 4 - "Config Models & Schemas"
Cohesion: 0.12
Nodes (15): BRAT, Code Block Configuration, Comparison, Credits, Custom Themes, Diff Highlighting, Inline Highlighting, Installation (+7 more)

### Community 5 - "EcEngine.ts"
Cohesion: 0.20
Nodes (10): encodeCssVarTheme(), createEcEngineConfig(), EcThemeInput, getECTheme(), @expressive-code/core, @expressive-code/plugin-collapsible-sections, @expressive-code/plugin-frames, @expressive-code/plugin-line-numbers (+2 more)

### Community 6 - "EcRenderer.ts"
Cohesion: 0.24
Nodes (4): EcSettingsProps, EcEngine, EcEngineInput, hast-util-to-dom

### Community 7 - "Inline Code Block Renderer"
Cohesion: 0.10
Nodes (10): Domain glossary, Keep the stale-render guards in each consumer, CodeBlock, CodeBlockRenderer, FenceMetaReader, FenceMetaReaderDeps, FenceSectionInfo, InlineCodeBlock (+2 more)

### Community 8 - "vite.config.mts"
Cohesion: 0.18
Nodes (9): createEcEngine(), @lemons_dev/lemons-obsidian-plugin-automation, vite, vite-plugin-banner, vite-plugin-node-polyfills, vite-plugin-static-copy, expressiveCodeBundlePlugin(), externalNodeBuiltins (+1 more)

### Community 9 - "beginCaptures"
Cohesion: 0.22
Nodes (11): name, name, name, 4, 5, 6, 4, 5 (+3 more)

### Community 11 - "Expressive Code Feature Demo"
Cohesion: 0.08
Nodes (24): compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, importHelpers, isolatedModules, lib, module (+16 more)

### Community 12 - "1"
Cohesion: 0.39
Nodes (8): name, name, 1, 2, 3, beginCaptures, beginCaptures, beginCaptures

### Community 18 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, check, check:fix, deploy, dev, format, format:check (+6 more)

### Community 20 - "ESLint Utility Functions"
Cohesion: 0.11
Nodes (18): patterns, patterns, patterns, patterns, patterns, repository, assignments, attribute (+10 more)

### Community 21 - "Obsidian App Types"
Cohesion: 0.16
Nodes (16): captures, 1, 2, captures, match, name, captures, match (+8 more)

### Community 22 - "case-clause"
Cohesion: 0.33
Nodes (6): begin, beginCaptures, end, name, patterns, case-clause

### Community 23 - "Cm6_RangeParser.ts"
Cohesion: 0.13
Nodes (21): buildDecorationSet(), HighlightableRange, DecorationSets, PipelineDeps, PipelineInput, rebuildDecorations(), RebuildResult, checkSelectionOverlap() (+13 more)

### Community 24 - "obsidian-shiki-plugin"
Cohesion: 0.25
Nodes (7): Dependencies, Highlighter structure, Narrow host interfaces, obsidian-shiki-plugin, Package structure, Settings store, Upstream

### Community 27 - "manifest.json"
Cohesion: 0.29
Nodes (3): OPTIONAL, REQUIRED, targets

### Community 28 - "devDependencies"
Cohesion: 0.06
Nodes (33): devDependencies, @codemirror/language, @codemirror/state, @codemirror/view, @eslint/js, eslint-plugin-import-x, eslint-plugin-no-relative-import-paths, eslint-plugin-obsidianmd (+25 more)

### Community 29 - "0"
Cohesion: 0.29
Nodes (7): begin, beginCaptures, end, endCaptures, name, patterns, block-comment

### Community 30 - "block-definition"
Cohesion: 0.29
Nodes (7): begin, beginCaptures, end, endCaptures, name, patterns, block-definition

### Community 31 - "case-clause"
Cohesion: 0.20
Nodes (9): author, authorUrl, description, fundingUrl, id, isDesktopOnly, minAppVersion, name (+1 more)

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
Cohesion: 0.25
Nodes (8): name, 0, begin, beginCaptures, end, name, patterns, import-declaration

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
Nodes (6): slice, begin, beginCaptures, end, name, patterns

### Community 41 - "0"
Cohesion: 0.50
Nodes (4): endCaptures, 0, endCaptures, endCaptures

### Community 42 - "block-label"
Cohesion: 0.67
Nodes (3): match, name, block-label

### Community 43 - "constant-assignment"
Cohesion: 0.67
Nodes (3): type-declaration, name, patterns

### Community 44 - "distinct-type-assignment"
Cohesion: 0.40
Nodes (5): begin, end, name, patterns, distinct-type-assignment

### Community 45 - "punctuation"
Cohesion: 0.67
Nodes (3): variable-assignment, match, name

### Community 46 - "type-name"
Cohesion: 0.67
Nodes (3): type-name, match, name

### Community 47 - "procedure-assignment"
Cohesion: 0.40
Nodes (5): begin, end, name, patterns, procedure-assignment

### Community 49 - "type-annotation"
Cohesion: 0.40
Nodes (5): type-annotation, begin, end, name, patterns

### Community 50 - "type-assignment"
Cohesion: 0.40
Nodes (5): type-assignment, begin, end, name, patterns

### Community 51 - "punctuation"
Cohesion: 0.67
Nodes (3): match, name, punctuation

### Community 52 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, @codemirror/state, @codemirror/view

### Community 53 - "resolutions"
Cohesion: 0.67
Nodes (3): resolutions, @codemirror/state, @codemirror/view

### Community 80 - "package.json"
Cohesion: 0.10
Nodes (22): author, description, keywords, license, main, name, version, @eslint/js (+14 more)

## Knowledge Gaps
- **40 isolated node(s):** `@happy-dom/global-registrator`, `@lezer/common`, `@tsconfig/svelte`, `@types/bun`, `@types/prismjs` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 316 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `repository` connect `ESLint Utility Functions` to `Obsidian App Types`, `case-clause`, `0`, `block-definition`, `parameters`, `odin.json`, `file-tags`, `import-declaration`, `map-bitset`, `object-definition`, `return-type-declaration`, `slice`, `block-label`, `constant-assignment`, `distinct-type-assignment`, `punctuation`, `type-name`, `procedure-assignment`, `type-annotation`, `type-assignment`, `punctuation`, `keywords`, `statements`, `code:`md`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `@happy-dom/global-registrator`, `@lezer/common`, `@tsconfig/svelte` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ShikiPlugin` be split into smaller, more focused modules?**
  _Cohesion score 0.06363636363636363 - nodes in this community are weakly interconnected._
- **Why does `obsidian` connect `Theme & Render Core` to `package.json`, `Plugin Settings Management`, `Cm6_RangeParser.ts`, `Inline Code Block Renderer`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `Theme & Render Core` be split into smaller, more focused modules?**
  _Cohesion score 0.05827067669172932 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Plugin Settings Management` be split into smaller, more focused modules?**
  _Cohesion score 0.07329462989840348 - nodes in this community are weakly interconnected._