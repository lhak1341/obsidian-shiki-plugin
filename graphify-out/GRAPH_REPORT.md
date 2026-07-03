# Graph Report - .  (2026-07-03)

## Corpus Check
- Corpus is ~13,849 words - fits in a single context window. You may not need a graph.

## Summary
- 200 nodes · 271 edges · 22 communities (9 shown, 13 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

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
- [[_COMMUNITY_Inline Code Patterns|Inline Code Patterns]]
- [[_COMMUNITY_Highlightable Ranges|Highlightable Ranges]]
- [[_COMMUNITY_Decoration Builders|Decoration Builders]]
- [[_COMMUNITY_ESLint Utility Functions|ESLint Utility Functions]]
- [[_COMMUNITY_Obsidian App Types|Obsidian App Types]]

## God Nodes (most connected - your core abstractions)
1. `ShikiPlugin` - 32 edges
2. `CodeHighlighter` - 15 edges
3. `ShikiPlugin` - 10 edges
4. `CodeBlock` - 9 edges
5. `ThemeMapper` - 9 edges
6. `ShikiRenderer` - 8 edges
7. `InlineCodeBlock` - 8 edges
8. `SettingsStore` - 8 edges
9. `CodeBlock` - 8 edges
10. `CodeHighlighter` - 8 edges

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

## Communities (22 total, 13 thin omitted)

### Community 1 - "Theme & Render Core"
Cohesion: 0.12
Nodes (12): createEcEngineConfig(), EC_VIRTUAL_SETTINGS, EcConfigInput, encodeCssVarTheme(), EcRenderer, getECTheme(), CustomTheme, HighlighterHost (+4 more)

### Community 2 - "Plugin Settings Management"
Cohesion: 0.12
Nodes (7): DEFAULT_SETTINGS, FrameType, Settings, SettingsStore, ShikiSettingsTab, StringSelectModal, EcSettingsProps

### Community 3 - "Architecture & Integration Patterns"
Cohesion: 0.12
Nodes (24): EC Core Constraint, Highlighter Structure, Narrow Host Interfaces Pattern, SettingsStore Management, Cm6ViewPluginHost, createCm6Plugin, CodeBlock, CodeBlockHost (+16 more)

### Community 4 - "Config Models & Schemas"
Cohesion: 0.13
Nodes (16): createEcEngineConfig, EC_VIRTUAL_SETTINGS, EcConfigInput, EcSettingsProps, OBSIDIAN_THEME_IDENTIFIER, encodeCssVarTheme, getECTheme, OBSIDIAN_THEME (+8 more)

### Community 9 - "CodeMirror 6 Custom Decorations"
Cohesion: 0.38
Nodes (4): buildDecorationSet(), HighlightableRange, Cm6ViewPluginHost, createCm6Plugin()

### Community 10 - "Prism Syntax Integration"
Cohesion: 0.33
Nodes (5): PrismBeforeAllElementsHighlightEnv, PrismFilterHighlightApi, PrismFilterHighlightCondition, PrismFilterHighlightEnv, PrismWithFilterHighlightAll

### Community 11 - "Expressive Code Feature Demo"
Cohesion: 0.4
Nodes (6): CSS Custom Task List Icons, Custom Code Block Title, Diff Highlighting, Line Highlighting, Line Numbering, Expressive Code Feature Demonstration Screenshot

## Knowledge Gaps
- **38 isolated node(s):** `LANGUAGE_SPECIAL`, `CodeBlockHost`, `PrismFilterHighlightEnv`, `PrismFilterHighlightCondition`, `PrismFilterHighlightApi` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ShikiPlugin` connect `Plugin Entry & Init` to `Plugin Settings Management`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Why does `CodeHighlighter` connect `Code Highlighter Core` to `Theme & Render Core`, `Plugin Settings Management`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `CodeBlock` connect `Code Block Life Cycle` to `Plugin Settings Management`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `LANGUAGE_SPECIAL`, `CodeBlockHost`, `PrismFilterHighlightEnv` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Plugin Entry & Init` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Theme & Render Core` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Plugin Settings Management` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._