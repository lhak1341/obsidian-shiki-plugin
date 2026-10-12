import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type EditorState, RangeSet } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { type ThemedToken, type TokensResult } from 'shiki';
import { editorLivePreviewField } from 'obsidian';
import { rebuildDecorations } from 'packages/obsidian/src/codemirror/Cm6_Pipeline';
import { isRelevantNode, type WalkedEntry } from 'packages/obsidian/src/codemirror/Cm6_RangeParser';
import type { RenderTargetRegistry } from 'packages/obsidian/src/RenderTargets';
import type { Settings } from 'packages/obsidian/src/settings/Settings';

export interface Cm6Renderer {
	getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined>;
	getTokenStyle(token: ThemedToken): { style: string; classes: string[] };
}

export interface Cm6Settings {
	/** Re-read on every update: live settings change it in place, a flush replaces it. */
	readonly snapshot: Readonly<Pick<Settings, 'inlineHighlighting'>>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- not an easily named type
export function createCm6Plugin(renderer: Cm6Renderer, targets: RenderTargetRegistry, settings: Cm6Settings) {
	return ViewPlugin.fromClass(
		class Cm6ViewPlugin {
			decorations: DecorationSet;
			private fenced: DecorationSet = Decoration.none;
			private inline: DecorationSet = Decoration.none;
			view: EditorView;
			private updateGeneration = 0;
			private readonly unregister: () => void;

			constructor(view: EditorView) {
				this.view = view;
				this.decorations = Decoration.none;
				this.unregister = targets.register({ refresh: () => this.updateWidgets(this.view) });
				void this.updateWidgets(view);
			}

			update(update: ViewUpdate): void {
				try {
					this.fenced = this.fenced.map(update.changes);
					this.inline = this.inline.map(update.changes);
					this.decorations = RangeSet.join([this.fenced, this.inline]);
				} catch (e) {
					// Decorations may have stale positions if the document changed while an async
					// updateWidgets call was in flight. Reset them so the next update can rebuild.
					this.fenced = Decoration.none;
					this.inline = Decoration.none;
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
						if (isRelevantNode(node.type.name)) {
							entries.push({ typeName: node.type.name, from: node.from, to: node.to });
						}
					},
				});

				const result = await rebuildDecorations(
					entries,
					{
						getText: (from, to) => view.state.sliceDoc(from, to),
						getHighlightTokens: (code, l) => renderer.getHighlightTokens(code, l),
						getTokenStyle: token => renderer.getTokenStyle(token),
					},
					{ fenced: this.fenced, inline: this.inline },
					{
						selectionRanges: view.state.selection.ranges.map(r => ({ from: r.from, to: r.to })),
						inlineHighlighting: settings.snapshot.inlineHighlighting,
						isLivePreview: this.isLivePreview(view.state),
						docChanged,
					},
				);

				if (generation !== this.updateGeneration) return;

				this.fenced = result.fenced;
				this.inline = result.inline;
				this.decorations = result.combined;

				if (result.needsDispatch) {
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
				this.unregister();
				this.fenced = Decoration.none;
				this.inline = Decoration.none;
				this.decorations = Decoration.none;
			}
		},
		{
			decorations: v => v.decorations,
		},
	);
}
