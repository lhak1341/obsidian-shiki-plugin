/** The part of Obsidian's `MarkdownSectionInformation` the reader needs. */
export interface FenceSectionInfo {
	text: string;
	lineStart: number;
}

export interface FenceMetaReaderDeps {
	/** Obsidian's `ctx.getSectionInfo(el)`: null while not yet available. */
	sectionInfo(): FenceSectionInfo | null;
	language: string;
	wait(ms: number): Promise<void>;
}

// Obsidian updates getSectionInfo() some time after the DOM, so every read can come back
// null (not ready) or stale (a detached element reports only its own text). The budgets:
// - load: read now, then retry up to 5× (500 ms) before falling back to the cached meta.
// - note change: wait for Obsidian to catch up with the edit, read, retry once, then drop.
const RETRY_DELAY_MS = 100;
const NOTE_CHANGE_SETTLE_MS = 100;
const LOAD_RETRIES = 5;
const NOTE_CHANGE_RETRIES = 1;

/**
 * Reads the fence meta of one code block (the text after the language on its opening fence
 * line) and remembers the last value read.
 */
export class FenceMetaReader {
	private readonly deps: FenceMetaReaderDeps;
	private readonly pattern: RegExp;
	private cached = '';

	constructor(deps: FenceMetaReaderDeps) {
		this.deps = deps;
		const escapedLang = deps.language.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		this.pattern = new RegExp('^[^`~]*?\\s*(```+|~~~+)' + escapedLang + ' (.*)');
	}

	/** Resolves to the meta to render on load; falls back to the cached meta if section info never arrives. */
	async onLoad(): Promise<string> {
		const meta = this.read() ?? (await this.retry(LOAD_RETRIES));
		if (meta !== null) this.cached = meta;
		return this.cached;
	}

	/** Resolves to the new meta after the note changed, or null when it is unchanged or unavailable. */
	async onNoteChange(): Promise<string | null> {
		await this.deps.wait(NOTE_CHANGE_SETTLE_MS);
		const meta = this.read() ?? (await this.retry(NOTE_CHANGE_RETRIES));
		if (meta === null || meta === this.cached) return null;
		this.cached = meta;
		return meta;
	}

	/** The meta to rerender with: a fresh read if available, otherwise the cached meta. */
	onRefresh(): string {
		const meta = this.read();
		if (meta !== null) this.cached = meta;
		return this.cached;
	}

	private async retry(retries: number): Promise<string | null> {
		for (let i = 0; i < retries; i++) {
			await this.deps.wait(RETRY_DELAY_MS);
			const meta = this.read();
			if (meta !== null) return meta;
		}
		return null;
	}

	// Returns null when section info is not available yet or is stale.
	private read(): string | null {
		const sectionInfo = this.deps.sectionInfo();
		if (sectionInfo === null) return null;

		// lineStart out of bounds means sectionInfo.text is stale (e.g. from a detached element
		// returning only its text content rather than the full document). Treat as not-ready.
		const startLine = sectionInfo.text.split('\n')[sectionInfo.lineStart];
		if (startLine === undefined) return null;

		const match = this.pattern.exec(startLine);
		return match !== null ? match[2] : '';
	}
}
