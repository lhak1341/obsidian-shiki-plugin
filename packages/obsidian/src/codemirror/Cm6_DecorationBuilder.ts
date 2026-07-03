import { Decoration, type DecorationSet } from '@codemirror/view';
import { type Range } from '@codemirror/state';
import { type ThemedToken, type TokensResult } from 'shiki';

export interface HighlightableRange {
	from: number;
	to: number;
	lang: string;
	content: string;
	hideLang: boolean;
	hideTo?: number; // position where `{lang} ` prefix ends; undefined for fenced blocks
}

export async function buildDecorationSet(
	ranges: HighlightableRange[],
	getHighlightTokens: (code: string, lang: string) => Promise<TokensResult | undefined>,
	getTokenStyle: (token: ThemedToken) => { style: string; classes: string[] },
): Promise<DecorationSet> {
	const all: Range<Decoration>[] = [];

	for (const range of ranges) {
		if (range.lang === '') continue;

		const result = await getHighlightTokens(range.content, range.lang.toLowerCase());
		if (!result) continue;

		const contentFrom = range.hideTo ?? range.from;

		if (range.hideLang && range.hideTo !== undefined) {
			all.push(Decoration.replace({}).range(range.from, range.hideTo));
		}

		const tokens = result.tokens.flat(1);
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			const next = tokens[i + 1];
			const { style, classes } = getTokenStyle(token);
			all.push(
				Decoration.mark({
					attributes: { style, class: classes.join(' ') },
				}).range(contentFrom + token.offset, next ? contentFrom + next.offset : range.to),
			);
		}
	}

	// RangeSet.update requires sorted order by from position
	all.sort((a, b) => a.from - b.from);
	return Decoration.none.update({ add: all });
}
