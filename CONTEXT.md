# Domain glossary

**Fence meta** — the text after the language on a code fence's opening line (`wrap title="x"` in
` ```ts wrap title="x" `), passed to Expressive Code as `meta`. Obsidian does not give it to a
code block processor, so it is read from Obsidian's section info, which can lag behind the DOM or
be stale for a detached element. `FenceMetaReader` (`packages/obsidian/src/FenceMeta.ts`) owns
the read, the wait budgets and the last value read.
