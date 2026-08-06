import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { type ThemedToken, type TokensResult } from 'shiki';
import { editorLivePreviewField } from 'obsidian';
import { buildDecorationSet } from 'packages/obsidian/src/codemirror/Cm6_DecorationBuilder';
import { parseFencedRanges, type WalkedEntry } from 'packages/obsidian/src/codemirror/Cm6_RangeParser';

export interface Cm6ViewPluginHost {
	readonly inlineHighlighting: boolean;
	addCm6Plugin(cb: () => Promise<void>): void;
	removeCm6Plugin(cb: () => Promise<void>): void;
	getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined>;
	getTokenStyle(token: ThemedToken): { style: string; classes: string[] };
}

const RELEVANT_NODE_PROPS = ['inline-code', 'HyperMD-codeblock', 'HyperMD-codeblock-begin', 'HyperMD-codeblock-end'];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- not an easily named type
export function createCm6Plugin(host: Cm6ViewPluginHost) {
	return ViewPlugin.fromClass(
		class Cm6ViewPlugin {
			decorations: DecorationSet;
			view: EditorView;
			private updateGeneration = 0;
			private readonly reloadCb: () => Promise<void>;

			constructor(view: EditorView) {
				this.view = view;
				this.decorations = Decoration.none;
				this.reloadCb = (): Promise<void> => this.updateWidgets(this.view);
				host.addCm6Plugin(this.reloadCb);
				void this.updateWidgets(view);
			}

			update(update: ViewUpdate): void {
				try {
					this.decorations = this.decorations.map(update.changes);
				} catch (e) {
					// Decorations may have stale positions if the document changed while an async
					// updateWidgets call was in flight. Reset them so the next update can rebuild.
					this.decorations = Decoration.none;
					console.warn('Resetting decorations due to error:', e);
				}

				if (update.docChanged || update.selectionSet) {
					this.view = update.view;
					void this.updateWidgets(update.view, update.docChanged);
				}
			}

			isLivePreview(state: EditorState): boolean {
				return state.field(editorLivePreviewField);
			}

			async updateWidgets(view: EditorView, docChanged: boolean = true): Promise<void> {
				const generation = ++this.updateGeneration;
				const entries: WalkedEntry[] = [];

				syntaxTree(view.state).iterate({
					enter: nodeRef => {
						const node = nodeRef.node;
						const props = node.type.name?.split('_') ?? [];

						if (props.includes('formatting')) return;
						if (RELEVANT_NODE_PROPS.some(p => props.includes(p))) {
							entries.push({ typeName: node.type.name, from: node.from, to: node.to });
						}
					},
				});

				const ranges = parseFencedRanges(
					entries,
					(from, to) => view.state.sliceDoc(from, to),
					view.state.selection.ranges.map(r => ({ from: r.from, to: r.to })),
					{
						inlineHighlighting: host.inlineHighlighting,
						isLivePreview: this.isLivePreview(view.state),
						docChanged,
					},
				);

				// capture before await so we know whether to dispatch even if ranges is now empty
				const needsDispatch = ranges.length > 0 || this.decorations.size > 0;

				const newDecorations = await buildDecorationSet(
					ranges,
					(code, l) => host.getHighlightTokens(code, l),
					token => host.getTokenStyle(token),
				);

				if (generation !== this.updateGeneration) return;

				this.decorations = newDecorations;

				if (needsDispatch) {
					// Use requestAnimationFrame to avoid "Calls to EditorView.update are not allowed while an update is in progress".
					// Update the view directly instead of dispatching an empty transaction. A
					// transaction during IME composition can interrupt the browser's composing
					// text, notably with the Windows Korean IME.
					window.requestAnimationFrame(() => {
						if (generation === this.updateGeneration) {
							this.view.update([]);
						}
					});
				}
			}

			destroy(): void {
				host.removeCm6Plugin(this.reloadCb);
				this.decorations = Decoration.none;
			}
		},
		{
			decorations: v => v.decorations,
		},
	);
}
