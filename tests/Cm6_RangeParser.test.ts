import { describe, test, expect } from 'bun:test';
import { isRelevantNode, parseHighlightableRanges, type WalkedEntry } from 'packages/obsidian/src/codemirror/Cm6_RangeParser';

// Helpers

function makeGetText(doc: string): (from: number, to: number) => string {
	return (from, to) => doc.slice(from, to);
}

const baseOpts = { inlineHighlighting: true, isLivePreview: false };

// Tests

describe('parseHighlightableRanges', () => {
	test('inline-code matching SHIKI_INLINE_REGEX, inlineHighlighting=true → range pushed', () => {
		const doc = '{js} foo';
		const entries: WalkedEntry[] = [{ typeName: 'inline-code', from: 0, to: 8 }];
		const { inline: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [], baseOpts);

		expect(ranges).toHaveLength(1);
		expect(ranges[0]).toEqual({ from: 0, to: 8, lang: 'js', content: 'foo', hideLang: false, hideTo: 5 });
	});

	test('inline-code, inlineHighlighting=false → not pushed', () => {
		const doc = '{js} foo';
		const entries: WalkedEntry[] = [{ typeName: 'inline-code', from: 0, to: 8 }];
		const { inline: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [], { ...baseOpts, inlineHighlighting: false });

		expect(ranges).toHaveLength(0);
	});

	test('inline-code, content does not match SHIKI_INLINE_REGEX → not pushed', () => {
		const doc = 'not inline code';
		const entries: WalkedEntry[] = [{ typeName: 'inline-code', from: 0, to: doc.length }];
		const { inline: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [], baseOpts);

		expect(ranges).toHaveLength(0);
	});

	test('hideLang=true when isLivePreview and no selection overlap', () => {
		const doc = '{js} foo';
		const entries: WalkedEntry[] = [{ typeName: 'inline-code', from: 0, to: 8 }];
		const { inline: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [{ from: 100, to: 105 }], { ...baseOpts, isLivePreview: true });

		expect(ranges[0].hideLang).toBe(true);
	});

	test('hideLang=false when selection overlaps the node', () => {
		const doc = '{js} foo';
		const entries: WalkedEntry[] = [{ typeName: 'inline-code', from: 0, to: 8 }];
		const { inline: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [{ from: 3, to: 3 }], { ...baseOpts, isLivePreview: true });

		expect(ranges[0].hideLang).toBe(false);
	});

	test('hideLang=false when isLivePreview=false regardless of selection', () => {
		const doc = '{js} foo';
		const entries: WalkedEntry[] = [{ typeName: 'inline-code', from: 0, to: 8 }];
		const { inline: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [{ from: 100, to: 105 }], { ...baseOpts, isLivePreview: false });

		expect(ranges[0].hideLang).toBe(false);
	});

	test('fenced block with valid lang → one range spanning fenced lines', () => {
		const doc = '```js\nfoo\nbar\n```';
		const entries: WalkedEntry[] = [
			{ typeName: 'HyperMD-codeblock-begin', from: 0, to: 5 },
			{ typeName: 'HyperMD-codeblock', from: 6, to: 9 },
			{ typeName: 'HyperMD-codeblock', from: 10, to: 13 },
			{ typeName: 'HyperMD-codeblock-end', from: 14, to: 17 },
		];
		const { fenced: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [], baseOpts);

		expect(ranges).toHaveLength(1);
		expect(ranges[0]).toEqual({ from: 6, to: 13, lang: 'js', content: 'foo\nbar', hideLang: false });
	});

	test('fenced begin with no extractable lang → no range, state resets', () => {
		const doc = '```\nfoo\n```'; // fence with no lang after it
		const entries: WalkedEntry[] = [
			{ typeName: 'HyperMD-codeblock-begin', from: 0, to: 3 },
			{ typeName: 'HyperMD-codeblock', from: 4, to: 7 },
			{ typeName: 'HyperMD-codeblock-end', from: 8, to: 11 },
		];
		const { fenced: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [], baseOpts);

		expect(ranges).toHaveLength(0);
	});

	test('fenced end with zero fenced lines → no range', () => {
		const doc = '```js\n```';
		const entries: WalkedEntry[] = [
			{ typeName: 'HyperMD-codeblock-begin', from: 0, to: 5 },
			{ typeName: 'HyperMD-codeblock-end', from: 6, to: 9 },
		];
		const { fenced: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [], baseOpts);

		expect(ranges).toHaveLength(0);
	});

	test('returns fenced and inline ranges together, independent of selection', () => {
		const doc = '{js} foo```js\nfoo\nbar\n```';
		const entries: WalkedEntry[] = [
			{ typeName: 'inline-code', from: 0, to: 8 },
			{ typeName: 'HyperMD-codeblock-begin', from: 8, to: 13 },
			{ typeName: 'HyperMD-codeblock', from: 14, to: 17 },
			{ typeName: 'HyperMD-codeblock', from: 18, to: 21 },
			{ typeName: 'HyperMD-codeblock-end', from: 22, to: 25 },
		];
		const { fenced, inline } = parseHighlightableRanges(entries, makeGetText(doc), [{ from: 15, to: 15 }], baseOpts);

		expect(inline).toHaveLength(1);
		expect(inline[0].from).toBe(0);
		expect(fenced).toHaveLength(1);
		expect(fenced[0].lang).toBe('js');
	});

	test('two sequential fenced blocks → state resets between them', () => {
		const doc = '```js\nfoo\n``````ts\nbar\n```';
		const entries: WalkedEntry[] = [
			{ typeName: 'HyperMD-codeblock-begin', from: 0, to: 5 },
			{ typeName: 'HyperMD-codeblock', from: 6, to: 9 },
			{ typeName: 'HyperMD-codeblock-end', from: 10, to: 13 },
			{ typeName: 'HyperMD-codeblock-begin', from: 13, to: 18 },
			{ typeName: 'HyperMD-codeblock', from: 19, to: 22 },
			{ typeName: 'HyperMD-codeblock-end', from: 23, to: 26 },
		];
		const { fenced: ranges } = parseHighlightableRanges(entries, makeGetText(doc), [], baseOpts);

		expect(ranges).toHaveLength(2);
		expect(ranges[0]).toEqual({ from: 6, to: 9, lang: 'js', content: 'foo', hideLang: false });
		expect(ranges[1]).toEqual({ from: 19, to: 22, lang: 'ts', content: 'bar', hideLang: false });
	});
});

describe('isRelevantNode', () => {
	test.each([
		['inline-code', true],
		['HyperMD-codeblock', true],
		['HyperMD-codeblock-begin', true],
		['HyperMD-codeblock-end', true],
		['HyperMD-codeblock_HyperMD-codeblock-bg', true],
		['inline-code_formatting', false],
		['formatting_HyperMD-codeblock', false],
		['hmd-codeblock', false],
		['em', false],
		[undefined, false],
	])('%s → %s', (typeName, expected) => {
		expect(isRelevantNode(typeName)).toBe(expected);
	});
});
