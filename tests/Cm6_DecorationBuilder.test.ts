import { describe, test, expect } from 'bun:test';
import { buildDecorationSet, type HighlightableRange } from 'packages/obsidian/src/codemirror/Cm6_DecorationBuilder';
import { type ThemedToken, type TokensResult } from 'shiki';

// Helpers

function makeTokensResult(tokens: Array<{ offset: number; content: string }>): TokensResult {
	return {
		tokens: [tokens.map(t => ({ offset: t.offset, content: t.content }) as ThemedToken)],
	} as TokensResult;
}

const mockStyle = (_token: ThemedToken) => ({ style: 'color: red;', classes: ['tok'] });

function collectDecorations(set: Awaited<ReturnType<typeof buildDecorationSet>>): Array<{ from: number; to: number }> {
	const found: Array<{ from: number; to: number }> = [];
	set.between(0, 10_000, (from, to) => {
		found.push({ from, to });
	});
	return found;
}

// Tests

describe('buildDecorationSet', () => {
	test('empty ranges → empty set', async () => {
		const result = await buildDecorationSet([], async () => undefined, mockStyle);
		expect(result.size).toBe(0);
	});

	test('range with empty lang → skipped', async () => {
		const range: HighlightableRange = { from: 0, to: 10, lang: '', content: 'hello', hideLang: false };
		const result = await buildDecorationSet([range], async () => makeTokensResult([{ offset: 0, content: 'hello' }]), mockStyle);
		expect(result.size).toBe(0);
	});

	test('getHighlightTokens returns undefined → skipped', async () => {
		const range: HighlightableRange = { from: 0, to: 10, lang: 'js', content: 'x', hideLang: false };
		const result = await buildDecorationSet([range], async () => undefined, mockStyle);
		expect(result.size).toBe(0);
	});

	test('single token, no hideLang → one mark decoration spanning full range', async () => {
		const range: HighlightableRange = { from: 10, to: 20, lang: 'js', content: 'hello', hideLang: false };
		const result = await buildDecorationSet(
			[range],
			async () => makeTokensResult([{ offset: 0, content: 'hello' }]),
			mockStyle,
		);

		const decs = collectDecorations(result);
		expect(decs).toHaveLength(1);
		expect(decs[0]).toEqual({ from: 10, to: 20 });
	});

	test('multiple tokens — last token extends to range.to', async () => {
		const range: HighlightableRange = { from: 0, to: 15, lang: 'js', content: 'foo bar', hideLang: false };
		const result = await buildDecorationSet(
			[range],
			async () => makeTokensResult([
				{ offset: 0, content: 'foo' },
				{ offset: 4, content: 'bar' },
			]),
			mockStyle,
		);

		const decs = collectDecorations(result);
		expect(decs).toHaveLength(2);
		expect(decs[0]).toEqual({ from: 0, to: 4 });   // first token: 0 → next.offset 4
		expect(decs[1]).toEqual({ from: 4, to: 15 });  // last token: 4 → range.to 15
	});

	test('hideLang=true → replace decoration before mark decorations', async () => {
		// Simulates `{js} foo` inline code: from=5, hideTo=10 (hides `{js} `), to=13
		const range: HighlightableRange = { from: 5, to: 13, lang: 'js', content: 'foo', hideLang: true, hideTo: 10 };
		const result = await buildDecorationSet(
			[range],
			async () => makeTokensResult([{ offset: 0, content: 'foo' }]),
			mockStyle,
		);

		const decs = collectDecorations(result);
		// replace decoration + one mark decoration
		expect(decs).toHaveLength(2);
		expect(decs[0]).toEqual({ from: 5, to: 10 });  // replace: hides `{js} `
		expect(decs[1]).toEqual({ from: 10, to: 13 }); // mark: the code token
	});

	test('hideLang=false with hideTo present → no replace decoration', async () => {
		const range: HighlightableRange = { from: 5, to: 13, lang: 'js', content: 'foo', hideLang: false, hideTo: 10 };
		const result = await buildDecorationSet(
			[range],
			async () => makeTokensResult([{ offset: 0, content: 'foo' }]),
			mockStyle,
		);

		const decs = collectDecorations(result);
		// only the mark decoration, starting at hideTo (contentFrom = 10)
		expect(decs).toHaveLength(1);
		expect(decs[0]).toEqual({ from: 10, to: 13 });
	});

	test('multiple ranges → all decorations present and sorted', async () => {
		const ranges: HighlightableRange[] = [
			{ from: 0, to: 5, lang: 'js', content: 'a', hideLang: false },
			{ from: 20, to: 25, lang: 'ts', content: 'b', hideLang: false },
		];
		const result = await buildDecorationSet(
			ranges,
			async () => makeTokensResult([{ offset: 0, content: 'x' }]),
			mockStyle,
		);

		const decs = collectDecorations(result);
		expect(decs).toHaveLength(2);
		expect(decs[0].from).toBeLessThan(decs[1].from); // sorted
		expect(decs[0]).toEqual({ from: 0, to: 5 });
		expect(decs[1]).toEqual({ from: 20, to: 25 });
	});

	test('lang is lowercased before passing to getHighlightTokens', async () => {
		const seen: string[] = [];
		const range: HighlightableRange = { from: 0, to: 5, lang: 'TypeScript', content: 'x', hideLang: false };
		await buildDecorationSet(
			[range],
			async (code, lang) => { seen.push(lang); return undefined; },
			mockStyle,
		);
		expect(seen).toEqual(['typescript']);
	});
});
