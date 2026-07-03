# Graph Report - obsidian-shiki-plugin  (2026-07-03)

## Corpus Check
- 28 files · ~14,044 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 260 nodes · 327 edges · 27 communities (12 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `105b7694`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Plugin Entry & Init|Plugin Entry & Init]]
- [[_COMMUNITY_Theme & Render Core|Theme & Render Core]]
- [[_COMMUNITY_Plugin Settings Management|Plugin Settings Management]]
- [[_COMMUNITY_Architecture & Integration Patterns|Architecture & Integration Patterns]]
- [[_COMMUNITY_Config Models & Schemas|Config Models & Schemas]]
- [[_COMMUNITY_Code Highlighter Core|Code Highlighter Core]]
- [[_COMMUNITY_Code Block Life Cycle|Code Block Life Cycle]]
- [[_COMMUNITY_Inline Code Block Renderer|Inline Code Block Renderer]]
- [[_COMMUNITY_Shiki Tokenizer Core|Shiki Tokenizer Core]]
- [[_COMMUNITY_CodeMirror 6 Custom Decorations|CodeMirror 6 Custom Decorations]]
- [[_COMMUNITY_Prism Syntax Integration|Prism Syntax Integration]]
- [[_COMMUNITY_Expressive Code Feature Demo|Expressive Code Feature Demo]]
- [[_COMMUNITY_Obsidian Default Highlight Demo|Obsidian Default Highlight Demo]]
- [[_COMMUNITY_Shiki Highlight Demo|Shiki Highlight Demo]]
- [[_COMMUNITY_Obsidian API Extensions|Obsidian API Extensions]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Vite Build Setup|Vite Build Setup]]
- [[_COMMUNITY_Inline Code Patterns|Inline Code Patterns]]
- [[_COMMUNITY_Highlightable Ranges|Highlightable Ranges]]
- [[_COMMUNITY_Decoration Builders|Decoration Builders]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `ShikiPlugin` - 32 edges
2. `CodeHighlighter` - 16 edges
3. `CodeBlock` - 10 edges
4. `ShikiPlugin` - 10 edges
5. `InlineCodeBlock` - 9 edges
6. `ThemeMapper` - 9 edges
7. `obsidian-shiki-plugin` - 9 edges
8. `ShikiRenderer` - 8 edges
9. `SettingsStore` - 8 edges
10. `CodeBlock` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Slides Presentation` --conceptually_related_to--> `CodeBlock`  [INFERRED]
  exampleVault/Slides.md → packages/obsidian/src/CodeBlock.ts
- `List Testing Note` --conceptually_related_to--> `CodeBlock`  [INFERRED]
  exampleVault/List.md → packages/obsidian/src/CodeBlock.ts
- `Vault Index Note` --conceptually_related_to--> `CodeBlock`  [INFERRED]
  exampleVault/index.md → packages/obsidian/src/CodeBlock.ts
- `Untitled Vault Note` --conceptually_related_to--> `CodeBlock`  [INFERRED]
  exampleVault/Untitled.md → packages/obsidian/src/CodeBlock.ts
- `Vault Index Note` --conceptually_related_to--> `InlineCodeBlock`  [INFERRED]
  exampleVault/index.md → packages/obsidian/src/InlineCodeBlock.ts

## Hyperedges (group relationships)
- **Plugin Configuration Flow** — settings_settings, settings_default_settings, settingsstore_settingsstore, config_ecsettingsprops, config_createecengineconfig [INFERRED 0.85]
- **Theme Resolution System** — obsidiantheme_obsidian_theme, thememapper_thememapper, thememapper_themecontext, constants_obsidian_theme_identifier [INFERRED 0.85]
- **Narrow Host Interfaces Pattern** — cm6_viewplugin_cm6viewpluginhost, codeblock_codeblockhost, inlinecodeblock_inlinecodeblockhost, highlighter_highlighterhost [EXTRACTED 1.00]
- **Obsidian Rendering Integration** — codeblock_codeblock, inlinecodeblock_inlinecodeblock, cm6_viewplugin_createcm6plugin [INFERRED 0.95]
- **Expressive Code Rendering Features** — exampleimage_custom_title, exampleimage_line_numbers, exampleimage_line_highlighting, exampleimage_diff_highlighting [EXTRACTED 1.00]

## Communities (27 total, 15 thin omitted)

### Community 1 - "Theme & Render Core"
Cohesion: 0.09
Nodes (12): DEFAULT_SETTINGS, FrameType, Settings, SettingsStore, ShikiSettingsTab, StringSelectModal, EcSettingsProps, PrismBeforeAllElementsHighlightEnv (+4 more)

### Community 2 - "Plugin Settings Management"
Cohesion: 0.11
Nodes (14): createEcEngineConfig(), EC_VIRTUAL_SETTINGS, EcConfigInput, FrameType, encodeCssVarTheme(), EcRenderer, getECTheme(), CustomTheme (+6 more)

### Community 3 - "Architecture & Integration Patterns"
Cohesion: 0.07
Nodes (26): BRAT, Code Block Configuration, code:md (Some inline code `{jsx} <button role="button" />`.), code:`md, code:block11, code:`md, code:block3, code:`md (+18 more)

### Community 4 - "Config Models & Schemas"
Cohesion: 0.12
Nodes (24): EC Core Constraint, Highlighter Structure, Narrow Host Interfaces Pattern, SettingsStore Management, Cm6ViewPluginHost, createCm6Plugin, CodeBlock, CodeBlockHost (+16 more)

### Community 5 - "Code Highlighter Core"
Cohesion: 0.13
Nodes (16): createEcEngineConfig, EC_VIRTUAL_SETTINGS, EcConfigInput, EcSettingsProps, OBSIDIAN_THEME_IDENTIFIER, encodeCssVarTheme, getECTheme, OBSIDIAN_THEME (+8 more)

### Community 9 - "CodeMirror 6 Custom Decorations"
Cohesion: 0.2
Nodes (9): ec-core constraint, ESLint, Highlighter structure, Known build warnings, Narrow host interfaces, obsidian-shiki-plugin, Package structure, Settings (+1 more)

### Community 10 - "Prism Syntax Integration"
Cohesion: 0.22
Nodes (8): code:ts (export class Parser<const SType extends STypeBase> {), code:css (input:is([data-task="式"], [data-task="式"] > *):checked::afte), code:css (input:is([data-task="式"], [data-task="式"] > *):checked::afte), code:bash (echo "Hello"), code:diff (+ this line will be marked as inserted), code:custom-odin (package main), code:cpp (#include <foo>), code:SQL (SELECT)

### Community 12 - "Obsidian Default Highlight Demo"
Cohesion: 0.38
Nodes (4): buildDecorationSet(), HighlightableRange, Cm6ViewPluginHost, createCm6Plugin()

### Community 13 - "Shiki Highlight Demo"
Cohesion: 0.4
Nodes (6): CSS Custom Task List Icons, Custom Code Block Title, Diff Highlighting, Line Highlighting, Line Numbering, Expressive Code Feature Demonstration Screenshot

### Community 14 - "Obsidian API Extensions"
Cohesion: 0.5
Nodes (3): code:block1 (- list), code:c (int a = 0;), code:block3 (- nested list)

## Knowledge Gaps
- **76 isolated node(s):** `LANGUAGE_SPECIAL`, `CodeBlockHost`, `PrismFilterHighlightEnv`, `PrismFilterHighlightCondition`, `PrismFilterHighlightApi` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ShikiPlugin` connect `Plugin Entry & Init` to `Theme & Render Core`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `CodeHighlighter` connect `Code Block Life Cycle` to `Theme & Render Core`, `Plugin Settings Management`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `CodeBlock` connect `Inline Code Block Renderer` to `Theme & Render Core`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `LANGUAGE_SPECIAL`, `CodeBlockHost`, `PrismFilterHighlightEnv` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Plugin Entry & Init` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Theme & Render Core` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Plugin Settings Management` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._