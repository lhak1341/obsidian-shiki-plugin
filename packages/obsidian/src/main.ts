import { debounce, loadPrism, Plugin, TFile, type MarkdownPostProcessor } from 'obsidian';
import type { ThemedToken, TokensResult } from 'shiki';
import { SHIKI_INLINE_REGEX } from 'packages/obsidian/src/constants';
import { CodeBlock } from 'packages/obsidian/src/CodeBlock';
import { createCm6Plugin } from 'packages/obsidian/src/codemirror/Cm6_ViewPlugin';
import { DEFAULT_SETTINGS, type Settings } from 'packages/obsidian/src/settings/Settings';
import { ShikiSettingsTab } from 'packages/obsidian/src/settings/SettingsTab';
import { filterHighlightAllPlugin, type PrismWithFilterHighlightAll } from 'packages/obsidian/src/PrismPlugin';
import { CodeHighlighter } from 'packages/obsidian/src/Highlighter';
import { InlineCodeBlock } from 'packages/obsidian/src/InlineCodeBlock';

import 'packages/obsidian/src/styles.css';
import 'virtual:ec-styles.css';
import 'virtual:ec-runtime';

export default class ShikiPlugin extends Plugin {
	highlighter!: CodeHighlighter;
	activeCodeBlocks!: Map<string, (CodeBlock | InlineCodeBlock)[]>;
	cm6Plugins!: Set<() => Promise<void>>;
	declare settings: Settings;
	loadedSettings!: Settings;
	private reloading = false;

	codeBlockProcessors: MarkdownPostProcessor[] = [];

	async onload(): Promise<void> {
		await this.loadSettings();
		this.loadedSettings = structuredClone(this.settings);
		this.addSettingTab(new ShikiSettingsTab(this));

		this.highlighter = new CodeHighlighter(this);
		await this.highlighter.load();

		this.activeCodeBlocks = new Map();
		this.cm6Plugins = new Set();

		this.registerInlineCodeProcessor();
		this.registerCodeBlockProcessors();

		this.registerEditorExtension([createCm6Plugin(this)]);

		// this is a workaround for the fact that obsidian does not rerender the code block
		// when the start line with the language changes, and we need that for the EC meta string
		this.registerEvent(
			this.app.vault.on('modify', async file => {
				// sleep 100ms so Obsidian has time to update getSectionInfo() before we rerender
				await sleep(100);

				if (file instanceof TFile) {
					if (this.activeCodeBlocks.has(file.path)) {
						for (const codeBlock of this.activeCodeBlocks.get(file.path)!) {
							void codeBlock.rerenderOnNoteChange();
						}
					}
				}
			}),
		);

		const debouncedReload = debounce(
			() => {
				void this.reloadHighlighter();
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
				void this.reloadHighlighter();
			},
		});

		await this.registerPrismPlugin();
	}

	async reloadHighlighter(): Promise<void> {
		if (this.reloading) return;
		this.reloading = true;
		try {
			await this.highlighter.unload();

			this.loadedSettings = structuredClone(this.settings);

			await this.highlighter.load();

			for (const [_, codeBlocks] of this.activeCodeBlocks) {
				for (const codeBlock of codeBlocks) {
					await codeBlock.forceRerender();
				}
			}

			for (const update of this.cm6Plugins) {
				await update();
			}
		} finally {
			this.reloading = false;
		}
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

						const codeBlock = new CodeBlock(this, el, source, language, ctx);

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
			const inlineCodes = el.findAll(':not(pre) > code');
			for (const codeElm of inlineCodes) {
				const match = SHIKI_INLINE_REGEX.exec(codeElm.textContent ?? ''); // format: `{lang} code`
				if (!match) {
					continue;
				}

				const codeBlock = new InlineCodeBlock(this, codeElm, match[2], match[1], ctx);

				ctx.addChild(codeBlock);
			}
		});
	}

	onunload(): void {
		void this.highlighter.unload();
	}

	addCm6Plugin(cb: () => Promise<void>): void {
		this.cm6Plugins.add(cb);
	}

	removeCm6Plugin(cb: () => Promise<void>): void {
		this.cm6Plugins.delete(cb);
	}

	addActiveCodeBlock(codeBlock: CodeBlock | InlineCodeBlock): void {
		const filePath = codeBlock.ctx.sourcePath;

		if (!this.activeCodeBlocks.has(filePath)) {
			this.activeCodeBlocks.set(filePath, [codeBlock]);
		} else {
			this.activeCodeBlocks.get(filePath)!.push(codeBlock);
		}
	}

	removeActiveCodeBlock(codeBlock: CodeBlock | InlineCodeBlock): void {
		const filePath = codeBlock.ctx.sourcePath;

		if (this.activeCodeBlocks.has(filePath)) {
			const index = this.activeCodeBlocks.get(filePath)!.indexOf(codeBlock);
			if (index !== -1) {
				this.activeCodeBlocks.get(filePath)!.splice(index, 1);
			}
		}
	}

	async loadSettings(): Promise<void> {
		try {
			this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as Settings;
		} catch (e) {
			console.warn('Failed to load settings, using defaults.', e);
			this.settings = Object.assign({}, DEFAULT_SETTINGS);
		}

		// migrate the theme to darkTheme and lightTheme
		if (this.settings.theme !== undefined) {
			this.settings.darkTheme = this.settings.theme;
			this.settings.lightTheme = this.settings.theme;
			this.settings.theme = undefined;
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
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

	get pluginName(): string {
		return this.manifest.name;
	}

	async resetTheme(which: 'dark' | 'light'): Promise<void> {
		if (which === 'dark') {
			this.settings.darkTheme = DEFAULT_SETTINGS.darkTheme;
			this.loadedSettings.darkTheme = DEFAULT_SETTINGS.darkTheme;
		} else {
			this.settings.lightTheme = DEFAULT_SETTINGS.lightTheme;
			this.loadedSettings.lightTheme = DEFAULT_SETTINGS.lightTheme;
		}
		await this.saveSettings();
	}

	getCustomThemes(): CodeHighlighter['customThemes'] {
		return this.highlighter.customThemes;
	}

	getSupportedLanguages(): string[] {
		return this.highlighter.supportedLanguages;
	}

	renderWithEc(code: string, language: string, meta: string, container: HTMLElement): Promise<void> {
		return this.highlighter.renderWithEc(code, language, meta, container);
	}

	getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined> {
		return this.highlighter.getHighlightTokens(code, lang);
	}

	renderTokens(tokens: ThemedToken[], container: HTMLElement): void {
		this.highlighter.renderTokens(tokens, container);
	}

	getTokenStyle(token: ThemedToken): { style: string; classes: string[] } {
		return this.highlighter.getTokenStyle(token);
	}

	get inlineHighlighting(): boolean {
		return this.loadedSettings.inlineHighlighting;
	}
}
