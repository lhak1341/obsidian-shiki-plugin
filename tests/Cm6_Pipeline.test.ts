import { describe, test, expect, mock } from 'bun:test';
import { Decoration } from '@codemirror/view';
import { type ThemedToken, type TokensResult } from 'shiki';
import { rebuildDecorations, type DecorationSets, type PipelineDeps, type PipelineInput } from 'packages/obsidian/src/codemirror/Cm6_Pipeline';
import { type WalkedEntry } from 'packages/obsidian/src/codemirror/Cm6_RangeParser';

// '{js} foo' is inline code at 0-8, the fenced python block's body is 'bar' at 15-18
const DOC = '{js} foo\n```py\nbar\n```';
const INLINE: WalkedEntry = { typeName: 'inline-code', from: 0, to: 8 };
const FENCE: WalkedEntry[] = [
	{ typeName: 'HyperMD-codeblock-begin', from: 9, to: 14 },
	{ typeName: 'HyperMD-codeblock', from: 15, to: 18 },
	{ typeName: 'HyperMD-codeblock-end', from: 19, to: 22 },
];
const ALL = [INLINE, ...FENCE];

const NONE: DecorationSets = { fenced: Decoration.none, inline: Decoration.none };

const makeDeps = (): PipelineDeps & { calls: ReturnType<typeof mock> } => {
	const calls = mock(async (code: string, _lang: string): Promise<TokensResult | undefined> => {
		return { tokens: [[{ offset: 0, content: code } as ThemedToken]] } as TokensResult;
	});
	return {
		calls,
		getText: (from, to) => DOC.slice(from, to),
		getHighlightTokens: calls,
		getTokenStyle: () => ({ style: 'color: red;', classes: ['tok'] }),
	};
};

const input = (overrides: Partial<PipelineInput> = {}): PipelineInput => ({
	selectionRanges: [{ from: 100, to: 100 }],
	inlineHighlighting: true,
	isLivePreview: false,
	docChanged: true,
	...overrides,
});

const froms = (set: DecorationSets['fenced']): number[] => {
	const found: number[] = [];
	set.between(0, 10_000, from => void found.push(from));
	// join keeps the two sets as separate layers, so iteration order across them is not positional
	return found.sort((x, y) => x - y);
};

describe('rebuildDecorations', () => {
	test('doc change builds both kinds and joins them', async () => {
		const result = await rebuildDecorations(ALL, makeDeps(), NONE, input());

		expect(result.fenced.size).toBe(1);
		expect(result.inline.size).toBe(1);
		expect(result.combined.size).toBe(2);
		expect(froms(result.combined)).toEqual([0 + 5, 15]);
	});

	test('selection-only change keeps the previous fenced set as the same object', async () => {
		const built = await rebuildDecorations(ALL, makeDeps(), NONE, input());
		const deps = makeDeps();

		const result = await rebuildDecorations(ALL, deps, built, input({ docChanged: false }));

		expect(result.fenced).toBe(built.fenced);
	});

	test('selection-only change does not tokenise fenced blocks', async () => {
		const built = await rebuildDecorations(ALL, makeDeps(), NONE, input());
		const deps = makeDeps();

		await rebuildDecorations(ALL, deps, built, input({ docChanged: false }));

		expect(deps.calls.mock.calls.map(c => c[1])).toEqual(['js']);
	});

	test('selection-only change keeps fenced decorations in the combined set', async () => {
		const built = await rebuildDecorations(ALL, makeDeps(), NONE, input());

		const result = await rebuildDecorations(ALL, makeDeps(), built, input({ docChanged: false }));

		expect(result.combined.size).toBe(2);
		expect(froms(result.combined)).toContain(15);
	});

	test('selection-only change with no previous fenced set leaves fenced empty', async () => {
		const result = await rebuildDecorations(ALL, makeDeps(), NONE, input({ docChanged: false }));

		expect(result.fenced.size).toBe(0);
		expect(result.inline.size).toBe(1);
	});

	test('inline hideLang follows the selection on a selection-only change', async () => {
		const live = { isLivePreview: true, docChanged: false };

		const away = await rebuildDecorations([INLINE], makeDeps(), NONE, input({ ...live, selectionRanges: [{ from: 100, to: 100 }] }));
		const inside = await rebuildDecorations([INLINE], makeDeps(), NONE, input({ ...live, selectionRanges: [{ from: 3, to: 3 }] }));

		// hidden prefix = one replace decoration plus the mark
		expect(away.inline.size).toBe(2);
		expect(inside.inline.size).toBe(1);
	});

	describe('needsDispatch', () => {
		test('false when nothing existed and nothing is inline', async () => {
			const result = await rebuildDecorations([], makeDeps(), NONE, input({ docChanged: false }));
			expect(result.needsDispatch).toBe(false);
		});

		test('true when decorations existed and are now gone', async () => {
			const built = await rebuildDecorations(ALL, makeDeps(), NONE, input());
			const result = await rebuildDecorations([], makeDeps(), built, input());
			expect(result.combined.size).toBe(0);
			expect(result.needsDispatch).toBe(true);
		});

		test('true when inline ranges appear', async () => {
			const result = await rebuildDecorations([INLINE], makeDeps(), NONE, input({ docChanged: false }));
			expect(result.needsDispatch).toBe(true);
		});

		test('true when fenced ranges appear on a doc change', async () => {
			const result = await rebuildDecorations(FENCE, makeDeps(), NONE, input());
			expect(result.needsDispatch).toBe(true);
		});

		test('false when only fenced ranges exist and the change is selection-only', async () => {
			const result = await rebuildDecorations(FENCE, makeDeps(), NONE, input({ docChanged: false }));
			expect(result.needsDispatch).toBe(false);
		});
	});
});
