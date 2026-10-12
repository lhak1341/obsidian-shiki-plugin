import { debounce, loadPrism, Notice, Plugin, TFile, type MarkdownPostProcessor } from 'obsidian';
import { SHIKI_INLINE_REGEX } from 'packages/obsidian/src/constants';
import { CodeBlock } from 'packages/obsidian/src/CodeBlock';
import { createCm6Plugin } from 'packages/obsidian/src/codemirror/Cm6_ViewPlugin';
import { DEFAULT_SETTINGS, type Settings } from 'packages/obsidian/src/settings/Settings';
import { ShikiSettingsTab } from 'packages/obsidian/src/settings/SettingsTab';
import { filterHighlightAllPlugin, type PrismWithFilterHighlightAll } from 'packages/obsidian/src/PrismPlugin';
import { CodeHighlighter } from 'packages/obsidian/src/Highlighter';
import { InlineCodeBlock } from 'packages/obsidian/src/InlineCodeBlock';
import { SettingsStore } from 'packages/obsidian/src/settings/SettingsStore';
import { RenderTargets } from 'packages/obsidian/src/RenderTargets';

import 'packages/obsidian/src/styles.css';
import 'virtual:ec-styles.css';
import 'virtual:ec-runtime';

export default class ShikiPlugin extends Plugin {
	store!: SettingsStore;
	highlighter!: CodeHighlighter;
	renderTargets!: RenderTargets;

	codeBlockProcessors: MarkdownPostProcessor[] = [];

	async onload(): Promise<void> {
		await this.loadSettings();

		this.highlighter = new CodeHighlighter(this);
		await this.highlighter.load();

		this.renderTargets = new RenderTargets({ reloadHighlighter: (): Promise<void> => this.highlighter.reload() });

		this.addSettingTab(new ShikiSettingsTab(this, this.store, this.highlighter, this.renderTargets));

		this.registerInlineCodeProcessor();
		this.registerCodeBlockProcessors();

		this.registerEditorExtension([createCm6Plugin(this.highlighter, this.renderTargets, this.store)]);

		// this is a workaround for the fact that obsidian does not rerender the code block
		// when the start line with the language changes, and we need that for the EC meta string
		this.registerEvent(
			this.app.vault.on('modify', file => {
				if (file instanceof TFile) this.renderTargets.rerenderFor(file.path);
			}),
		);

		const debouncedReload = debounce(
			() => {
				void this.renderTargets.reload();
			},
			500,
			true,
		);

		this.registerEvent(
			this.app.workspace.on('css-change', () => {
				debouncedReload();
			}),
		);

		this.addCommand({
			id: 'reload-highlighter',
			name: 'Reload highlighter',
			callback: () => {
				void this.renderTargets.reload();
			},
		});

		await this.registerPrismPlugin();
	}

	async registerPrismPlugin(): Promise<void> {
		const prism = (await loadPrism()) as PrismWithFilterHighlightAll;
		const filterHighlightAll = filterHighlightAllPlugin(prism);
		filterHighlightAll?.reject.addSelector('div.expressive-code pre code');
	}

	registerCodeBlockProcessors(): void {
		const languages = this.highlighter.obsidianSafeLanguageNames();

		for (const language of languages) {
			try {
				this.registerMarkdownCodeBlockProcessor(
					language,
					async (source, el, ctx) => {
						// we need to avoid making the hidden frontmatter code block visible
						if (el.parentElement?.classList.contains('mod-frontmatter')) {
							return;
						}

						const codeBlock = new CodeBlock(this.highlighter, this.renderTargets, el, source, language, ctx);

						ctx.addChild(codeBlock);
					},
					1000,
				);
			} catch (e) {
				console.warn(`Failed to register code block processor for ${language}.`, e);
			}
		}
	}

	registerInlineCodeProcessor(): void {
		this.registerMarkdownPostProcessor(async (el, ctx) => {
			// a live setting: read on every pass, so the next render of a note picks up a toggle
			if (!this.store.snapshot.inlineHighlighting) return;

			const inlineCodes = el.findAll(':not(pre) > code');
			for (const codeElm of inlineCodes) {
				const match = SHIKI_INLINE_REGEX.exec(codeElm.textContent ?? ''); // format: `{lang} code`
				if (!match) {
					continue;
				}

				const codeBlock = new InlineCodeBlock(this.highlighter, this.renderTargets, codeElm, match[2], match[1], ctx);

				ctx.addChild(codeBlock);
			}
		});
	}

	onunload(): void {
		void this.highlighter.unload();
	}

	async loadSettings(): Promise<void> {
		let loaded: Settings;
		try {
			loaded = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as Settings;
		} catch (e) {
			console.warn('Failed to load settings, using defaults.', e);
			loaded = Object.assign({}, DEFAULT_SETTINGS);
		}

		// migrate the theme to darkTheme and lightTheme
		if (loaded.theme !== undefined) {
			loaded.darkTheme = loaded.theme;
			loaded.lightTheme = loaded.theme;
			loaded.theme = undefined;
		}

		this.store = new SettingsStore(loaded, () => this.saveData(this.store.persisted));
	}

	// HighlighterHost implementation
	isDarkMode(): boolean {
		return this.app.isDarkMode();
	}

	vaultExists(path: string): Promise<boolean> {
		return this.app.vault.adapter.exists(path);
	}

	vaultList(path: string): Promise<{ files: string[] }> {
		return this.app.vault.adapter.list(path);
	}

	vaultRead(path: string): Promise<string> {
		return this.app.vault.adapter.read(path);
	}

	notify(message: string): void {
		new Notice(`${this.manifest.name}\n${message}`, 5000);
	}

	get engineSettings(): Readonly<Settings> {
		return this.store.snapshot;
	}

	refreshSettings(): void {
		this.store.flush();
	}

	async resetTheme(which: 'dark' | 'light'): Promise<void> {
		const key = which === 'dark' ? ('darkTheme' as const) : ('lightTheme' as const);
		await this.store.reset(key);
	}
}
