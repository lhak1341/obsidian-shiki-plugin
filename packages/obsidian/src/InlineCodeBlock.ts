import { type MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
import type { ThemedToken, TokensResult } from 'shiki';

export interface InlineCodeBlockHost {
	getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined>;
	renderTokens(tokens: ThemedToken[], container: HTMLElement): void;
	addActiveCodeBlock(block: InlineCodeBlock): void;
	removeActiveCodeBlock(block: InlineCodeBlock): void;
}

export class InlineCodeBlock extends MarkdownRenderChild {
	host: InlineCodeBlockHost;
	source: string;
	language: string;
	ctx: MarkdownPostProcessorContext;

	constructor(host: InlineCodeBlockHost, containerEl: HTMLElement, source: string, language: string, ctx: MarkdownPostProcessorContext) {
		super(containerEl);

		this.host = host;
		this.source = source;
		this.language = language;
		this.ctx = ctx;
	}

	private async render(): Promise<void> {
		this.containerEl.empty();
		this.containerEl.classList.add('shiki-inline');

		const highlight = await this.host.getHighlightTokens(this.source, this.language);
		const tokens = highlight?.tokens.flat(1);
		if (!tokens?.length) {
			this.containerEl.innerText = this.source;
			return;
		}

		this.host.renderTokens(tokens, this.containerEl);
	}

	public async rerenderOnNoteChange(): Promise<void> {
		// noop for inline code blocks
	}

	public async forceRerender(): Promise<void> {
		await this.render();
	}

	public onload(): void {
		super.onload();

		this.host.addActiveCodeBlock(this);

		void this.render();
	}

	public onunload(): void {
		super.onunload();

		this.host.removeActiveCodeBlock(this);

		this.containerEl.empty();
		this.containerEl.innerText = 'Unloaded shiki inline code block';
	}
}
