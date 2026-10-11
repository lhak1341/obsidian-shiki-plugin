# Tests

- `tests/happydom.ts` polyfills Obsidian globals (`createDiv`, `sleep`,
  `HTMLElement.prototype.empty`); new module stubs go in `tests/obsidianMock.ts`.
- `@codemirror/state` types are bun-testable without a DOM. `EditorView` needs integration
  tests, but `Decoration.*` from `@codemirror/view` is HappyDOM-testable — see
  `Cm6_DecorationBuilder.test.ts`.
- Obsidian's HyperMD parser (which produces `HyperMD-codeblock-*` nodes) ships inside the
  app, not as a package, so `syntaxTree()`-walking code cannot be tested against a real
  tree. Shape such logic to consume pre-walked plain data, keeping the walk (mechanical,
  untestable) separate from the classification (testable). `rebuildDecorations` in
  `Cm6_Pipeline.ts` is the testable entry point; `isRelevantNode` in `Cm6_RangeParser.ts`
  is the one place that names the nodes the walk collects.
- Shiki and CM6 values misbehave in assertions: pick theme names dynamically
  (`Object.keys(bundledThemes)[0]`; a hardcoded name breaks on a shiki upgrade),
  `structuredClone` a registration per test (shiki normalises it in place), and sort
  `RangeSet.join` positions (layers, not positional).
