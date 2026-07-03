import { type MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
import type { ThemedToken, TokensResult } from 'shiki';

export interface InlineCodeBlockHost {
	getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined>;
	renderTokens(tokens: ThemedToken[], container: HTMLElement): void;
	addActiveCodeBlock(block: InlineCodeBlock): void;
	removeActiveCodeBlock(block: InlineCodeBlock): void;
}

export class InlineCodeBlock extends MarkdownRenderChild {
	private readonly host: InlineCodeBlockHost;
	private readonly source: string;
	private readonly language: string;
	private readonly ctx: MarkdownPostProcessorContext;
	private renderGeneration = 0;
	private _active = false;

	constructor(host: InlineCodeBlockHost, containerEl: HTMLElement, source: string, language: string, ctx: MarkdownPostProcessorContext) {
		super(containerEl);

		this.host = host;
		this.source = source;
		this.language = language;
		this.ctx = ctx;
	}

	get sourcePath(): string { return this.ctx.sourcePath; }

	private async render(): Promise<void> {
		const gen = ++this.renderGeneration;

		const highlight = await this.host.getHighlightTokens(this.source, this.language);
		if (gen !== this.renderGeneration) return;
		if (!this._active) return;

		this.containerEl.empty();
		this.containerEl.classList.add('shiki-inline');

		const tokens = highlight?.tokens.flat(1);
		if (!tokens?.length) {
			this.containerEl.innerText = this.source;
			return;
		}

		this.host.renderTokens(tokens, this.containerEl);
	}

	public async forceRerender(): Promise<void> {
		await this.render();
	}

	public onload(): void {
		this._active = true;
		super.onload();

		this.host.addActiveCodeBlock(this);

		void this.render();
	}

	public onunload(): void {
		this._active = false;
		super.onunload();

		this.host.removeActiveCodeBlock(this);

		this.containerEl.empty();
		this.containerEl.innerText = 'Unloaded shiki inline code block';
	}
}
