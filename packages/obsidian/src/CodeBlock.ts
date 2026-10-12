import { type MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
import type { RenderTargetRegistry } from 'packages/obsidian/src/RenderTargets';
import { FenceMetaReader, type FenceSectionInfo } from 'packages/obsidian/src/FenceMeta';

export interface CodeBlockRenderer {
	renderWithEc(code: string, language: string, meta: string, container: HTMLElement): Promise<void>;
}

export class CodeBlock extends MarkdownRenderChild {
	private readonly renderer: CodeBlockRenderer;
	private readonly targets: RenderTargetRegistry;
	private readonly source: string;
	private readonly language: string;
	private readonly ctx: MarkdownPostProcessorContext;
	private readonly meta: FenceMetaReader;
	private renderGeneration = 0;
	private _active = false;
	private unregister: (() => void) | undefined;

	constructor(
		renderer: CodeBlockRenderer,
		targets: RenderTargetRegistry,
		containerEl: HTMLElement,
		source: string,
		language: string,
		ctx: MarkdownPostProcessorContext,
	) {
		super(containerEl);

		this.renderer = renderer;
		this.targets = targets;
		this.source = source;
		this.language = language;
		this.ctx = ctx;
		this.meta = new FenceMetaReader({ sectionInfo: (): FenceSectionInfo | null => ctx.getSectionInfo(this.containerEl), language, wait: sleep });
	}

	// Renders into a temp element and only applies to containerEl if this is still
	// the most recently started render (generation check) and this component
	// instance has not been unloaded (guards against CSS-reload teardown races).
	private async render(metaString: string): Promise<void> {
		const gen = ++this.renderGeneration;
		const tempEl = createDiv();
		await this.renderer.renderWithEc(this.source, this.language, metaString, tempEl);
		if (gen !== this.renderGeneration) return;
		if (!this._active) return;
		this.containerEl.empty();
		while (tempEl.firstChild) {
			this.containerEl.appendChild(tempEl.firstChild);
		}
	}

	public async rerenderOnNoteChange(): Promise<void> {
		// only rerender if the meta string changed: if the code block content changes
		// obsidian will rerender for us
		const meta = await this.meta.onNoteChange();
		if (meta !== null) await this.render(meta);
	}

	public async forceRerender(): Promise<void> {
		await this.render(this.meta.onRefresh());
	}

	public onload(): void {
		this._active = true;
		super.onload();

		this.unregister = this.targets.register({
			sourcePath: this.ctx.sourcePath,
			refresh: () => this.forceRerender(),
			onNoteChange: () => this.rerenderOnNoteChange(),
		});

		void this.meta.onLoad().then(meta => this.render(meta));
	}

	public onunload(): void {
		this._active = false;
		super.onunload();

		this.unregister?.();
		this.unregister = undefined;

		this.containerEl.empty();
		this.containerEl.innerText = 'Unloaded shiki code block';
	}
}
