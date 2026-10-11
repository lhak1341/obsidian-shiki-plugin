import { type DecorationSet } from '@codemirror/view';
import { RangeSet } from '@codemirror/state';
import { type ThemedToken, type TokensResult } from 'shiki';
import { buildDecorationSet } from 'packages/obsidian/src/codemirror/Cm6_DecorationBuilder';
import { parseHighlightableRanges, type SelectionRange, type WalkedEntry } from 'packages/obsidian/src/codemirror/Cm6_RangeParser';

export interface PipelineDeps {
	getText: (from: number, to: number) => string;
	getHighlightTokens: (code: string, lang: string) => Promise<TokensResult | undefined>;
	getTokenStyle: (token: ThemedToken) => { style: string; classes: string[] };
}

export interface PipelineInput {
	selectionRanges: SelectionRange[];
	inlineHighlighting: boolean;
	isLivePreview: boolean;
	docChanged: boolean;
}

export interface DecorationSets {
	fenced: DecorationSet;
	inline: DecorationSet;
}

export interface RebuildResult extends DecorationSets {
	combined: DecorationSet;
	/** Whether the view must be told to redraw: decorations existed or now exist. */
	needsDispatch: boolean;
}

/**
 * Turns pre-walked syntax-tree entries into decoration sets. A doc change rebuilds both kinds.
 * A selection-only change keeps `prev.fenced` as is and rebuilds only inline code, whose hidden
 * `{lang} ` prefix depends on the selection; fenced blocks do not, and re-tokenising them on
 * every cursor move is the expensive part.
 */
export async function rebuildDecorations(entries: WalkedEntry[], deps: PipelineDeps, prev: DecorationSets, input: PipelineInput): Promise<RebuildResult> {
	const { fenced, inline } = parseHighlightableRanges(entries, deps.getText, input.selectionRanges, {
		inlineHighlighting: input.inlineHighlighting,
		isLivePreview: input.isLivePreview,
	});

	// capture before awaiting so we dispatch even if the new ranges turn out empty
	const needsDispatch = prev.fenced.size > 0 || prev.inline.size > 0 || inline.length > 0 || (input.docChanged && fenced.length > 0);

	const fencedSet = input.docChanged ? await buildDecorationSet(fenced, deps.getHighlightTokens, deps.getTokenStyle) : prev.fenced;
	const inlineSet = await buildDecorationSet(inline, deps.getHighlightTokens, deps.getTokenStyle);

	return { fenced: fencedSet, inline: inlineSet, combined: RangeSet.join([fencedSet, inlineSet]), needsDispatch };
}
