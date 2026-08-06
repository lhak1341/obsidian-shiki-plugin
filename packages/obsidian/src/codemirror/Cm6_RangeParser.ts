import { type HighlightableRange } from 'packages/obsidian/src/codemirror/Cm6_DecorationBuilder';
import { SHIKI_INLINE_REGEX } from 'packages/obsidian/src/constants';

export interface WalkedEntry {
	typeName: string;
	from: number;
	to: number;
}

export interface SelectionRange {
	from: number;
	to: number;
}

export interface ParseFencedRangesOptions {
	inlineHighlighting: boolean;
	isLivePreview: boolean;
	docChanged: boolean;
}

function checkSelectionOverlap(selectionRanges: SelectionRange[], from: number, to: number): boolean {
	for (const range of selectionRanges) {
		if (range.from <= to && from <= range.to) return true;
	}
	return false;
}

export function parseFencedRanges(
	entries: WalkedEntry[],
	getText: (from: number, to: number) => string,
	selectionRanges: SelectionRange[],
	opts: ParseFencedRangesOptions,
): HighlightableRange[] {
	const ranges: HighlightableRange[] = [];
	let lang = '';
	let fencedLines: WalkedEntry[] = [];

	for (const entry of entries) {
		const props = entry.typeName?.split('_') ?? [];

		if (props.includes('inline-code')) {
			const content = getText(entry.from, entry.to);

			if (content.startsWith('{') && opts.inlineHighlighting) {
				const match = content.match(SHIKI_INLINE_REGEX);
				if (match) {
					const hasSelectionOverlap = checkSelectionOverlap(selectionRanges, entry.from - 1, entry.to + 1);
					ranges.push({
						from: entry.from,
						to: entry.to,
						lang: match[1],
						content: match[2],
						hideLang: opts.isLivePreview && !hasSelectionOverlap,
						hideTo: entry.from + match[1].length + 3,
					});
				}
			}
			continue;
		}

		// if !docChanged, this was a selection change — only inline-code nodes matter
		if (!opts.docChanged) continue;

		if (props.includes('HyperMD-codeblock') && !props.includes('HyperMD-codeblock-begin') && !props.includes('HyperMD-codeblock-end')) {
			fencedLines.push(entry);
			continue;
		}

		if (props.includes('HyperMD-codeblock-begin')) {
			const content = getText(entry.from, entry.to);
			lang = /(?:```+|~~~+)\s*(\S+)/.exec(content)?.[1] ?? '';
		}

		if (props.includes('HyperMD-codeblock-end')) {
			if (fencedLines.length > 0 && lang !== '') {
				const start = fencedLines[0].from;
				const end = fencedLines[fencedLines.length - 1].to;
				ranges.push({
					from: start,
					to: end,
					lang,
					content: getText(start, end),
					hideLang: false,
				});
			}
			lang = '';
			fencedLines = [];
		}
	}

	return ranges;
}
