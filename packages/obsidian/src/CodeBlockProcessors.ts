/** The post-processor registry calls `CodeBlockProcessors` needs; `main.ts` backs it with `MarkdownPreviewRenderer`. */
export interface ProcessorRegistrar<P> {
	create(language: string): P;
	register(processor: P): void;
	unregister(processor: P): void;
}

/**
 * Keeps one registered code block post-processor per highlighted language. `sync` runs after
 * every highlighter load, because excluded and custom languages change the set without a
 * plugin restart, and `registerMarkdownCodeBlockProcessor` offers no way to unregister.
 */
export class CodeBlockProcessors<P> {
	private readonly registrar: ProcessorRegistrar<P>;
	private readonly byLanguage = new Map<string, P>();

	constructor(registrar: ProcessorRegistrar<P>) {
		this.registrar = registrar;
	}

	/** Registers processors for new languages and removes those for dropped ones. Returns whether the set changed. */
	sync(languages: readonly string[]): boolean {
		const wanted = new Set(languages);
		let changed = false;

		for (const [language, processor] of this.byLanguage) {
			if (!wanted.has(language)) {
				this.registrar.unregister(processor);
				this.byLanguage.delete(language);
				changed = true;
			}
		}

		for (const language of wanted) {
			if (this.byLanguage.has(language)) continue;
			try {
				const processor = this.registrar.create(language);
				this.registrar.register(processor);
				this.byLanguage.set(language, processor);
				changed = true;
			} catch (e) {
				// some languages break Obsidian's code block processor; skip them rather than abort the sync
				console.warn(`Failed to register code block processor for ${language}.`, e);
			}
		}

		return changed;
	}

	has(language: string): boolean {
		return this.byLanguage.has(language);
	}

	clear(): void {
		for (const processor of this.byLanguage.values()) {
			this.registrar.unregister(processor);
		}
		this.byLanguage.clear();
	}
}
