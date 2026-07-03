import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type EditorSelection, type EditorState } from '@codemirror/state';
import { type SyntaxNode } from '@lezer/common';
import { syntaxTree } from '@codemirror/language';
import { type ThemedToken, type TokensResult } from 'shiki';
import { editorLivePreviewField } from 'obsidian';
import { SHIKI_INLINE_REGEX } from 'packages/obsidian/src/constants';
import { buildDecorationSet, type HighlightableRange } from 'packages/obsidian/src/codemirror/Cm6_DecorationBuilder';

export interface Cm6ViewPluginHost {
	readonly inlineHighlighting: boolean;
	addCm6Plugin(cb: () => Promise<void>): void;
	removeCm6Plugin(cb: () => Promise<void>): void;
	getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined>;
	getTokenStyle(token: ThemedToken): { style: string; classes: string[] };
}

function checkSelectionOverlap(selection: EditorSelection, from: number, to: number): boolean {
	for (const range of selection.ranges) {
		if (range.from <= to && from <= range.to) return true;
	}
	return false;
}

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
				const ranges: HighlightableRange[] = [];
				let lang = '';
				let fencedLines: SyntaxNode[] = [];

				syntaxTree(view.state).iterate({
					enter: nodeRef => {
						const node = nodeRef.node;
						const props = node.type.name?.split('_') ?? [];

						if (props.includes('formatting')) return;

						if (props.includes('inline-code')) {
							const content = view.state.sliceDoc(node.from, node.to);

							if (content.startsWith('{') && host.inlineHighlighting) {
								const match = content.match(SHIKI_INLINE_REGEX);
								if (match) {
									const hasSelectionOverlap = checkSelectionOverlap(view.state.selection, node.from - 1, node.to + 1);
									ranges.push({
										from: node.from,
										to: node.to,
										lang: match[1],
										content: match[2],
										hideLang: this.isLivePreview(view.state) && !hasSelectionOverlap,
										hideTo: node.from + match[1].length + 3,
									});
								}
							}
							return;
						}

						// if !docChanged, this was a selection change — only inline-code nodes matter
						if (!docChanged) return;

						if (props.includes('HyperMD-codeblock') && !props.includes('HyperMD-codeblock-begin') && !props.includes('HyperMD-codeblock-end')) {
							fencedLines.push(node);
							return;
						}

						if (props.includes('HyperMD-codeblock-begin')) {
							const content = view.state.sliceDoc(node.from, node.to);
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
									content: view.state.sliceDoc(start, end),
									hideLang: false,
								});
							}
							lang = '';
							fencedLines = [];
						}
					},
				});

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
					// Use requestAnimationFrame to avoid "Calls to EditorView.update are not allowed while an update is in progress"
					window.requestAnimationFrame(() => {
						if (generation === this.updateGeneration) {
							this.view.dispatch(this.view.state.update({}));
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
