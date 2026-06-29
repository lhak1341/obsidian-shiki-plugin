import { type MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
import type ShikiPlugin from 'packages/obsidian/src/main';

export class CodeBlock extends MarkdownRenderChild {
	plugin: ShikiPlugin;
	source: string;
	language: string;
	ctx: MarkdownPostProcessorContext;
	cachedMetaString: string;
	private renderGeneration = 0;
	private _active = false;

	constructor(plugin: ShikiPlugin, containerEl: HTMLElement, source: string, language: string, ctx: MarkdownPostProcessorContext) {
		super(containerEl);

		this.plugin = plugin;
		this.source = source;
		this.language = language;
		this.ctx = ctx;
		this.cachedMetaString = '';
	}

	// Returns null when getSectionInfo is not yet available or stale (element detached).
	private getMetaString(): string | null {
		const sectionInfo = this.ctx.getSectionInfo(this.containerEl);

		if (sectionInfo === null) {
			return null;
		}

		const lines = sectionInfo.text.split('\n');
		const startLine = lines[sectionInfo.lineStart];

		// lineStart out of bounds means sectionInfo.text is stale (e.g. from a detached element
		// returning only its text content rather than the full document). Treat as not-ready.
		if (startLine === undefined) {
			return null;
		}

		// regexp to match the text after the code block language
		const escapedLang = this.language.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp('^[^`~]*?\\s*(```+|~~~+)' + escapedLang + ' (.*)', 'g');
		const match = regex.exec(startLine);
		return match !== null ? match[2] : '';
	}

	// Renders into a temp element and only applies to containerEl if this is still
	// the most recently started render (generation check) and this component
	// instance has not been unloaded (guards against CSS-reload teardown races).
	private async render(metaString: string): Promise<void> {
		const gen = ++this.renderGeneration;
		const tempEl = createDiv();
		await this.plugin.highlighter.renderWithEc(this.source, this.language, metaString, tempEl);
		if (gen !== this.renderGeneration) return;
		if (!this._active) return;
		this.containerEl.empty();
		while (tempEl.firstChild) {
			this.containerEl.appendChild(tempEl.firstChild);
		}
	}

	public async rerenderOnNoteChange(): Promise<void> {
		// compare the new meta string to the cached one
		// only rerender if they are different, to avoid unnecessary work
		// since the meta string is likely to be the same most of the time
		// and if the code block content changes obsidian will rerender for us
		let newMetaString = this.getMetaString();
		if (newMetaString === null) {
			// Section info transiently unavailable (e.g. view is re-rendering).
			// One retry is enough: by the time the await resolves the view is stable.
			await sleep(100);
			newMetaString = this.getMetaString();
			if (newMetaString === null) return;
		}
		if (newMetaString !== this.cachedMetaString) {
			this.cachedMetaString = newMetaString;
			await this.render(newMetaString);
		}
	}

	public async forceRerender(): Promise<void> {
		const freshMeta = this.getMetaString();
		if (freshMeta !== null) this.cachedMetaString = freshMeta;
		await this.render(this.cachedMetaString);
	}

	public onload(): void {
		this._active = true;
		super.onload();

		this.plugin.addActiveCodeBlock(this);

		const metaString = this.getMetaString();
		if (metaString !== null) {
			this.cachedMetaString = metaString;
			void this.render(this.cachedMetaString);
		} else {
			// getSectionInfo not ready yet; defer render until Obsidian attaches section info.
			// Mirrors the sleep(100) pattern used in the vault modify handler in main.ts.
			// Retry up to 5× (500 ms total) before falling back to cachedMetaString.
			void (async (): Promise<void> => {
				for (let i = 0; i < 5; i++) {
					await sleep(100);
					const deferred = this.getMetaString();
					if (deferred !== null) {
						this.cachedMetaString = deferred;
						break;
					}
				}
				void this.render(this.cachedMetaString);
			})();
		}
	}

	public onunload(): void {
		this._active = false;
		super.onunload();

		this.plugin.removeActiveCodeBlock(this);

		this.containerEl.empty();
		this.containerEl.innerText = 'Unloaded shiki code block';
	}
}
