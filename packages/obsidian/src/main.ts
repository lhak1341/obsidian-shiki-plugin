import { debounce, loadPrism, MarkdownPreviewRenderer, MarkdownView, Notice, Plugin, TFile, type MarkdownPostProcessor } from 'obsidian';
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
import { CodeBlockProcessors } from 'packages/obsidian/src/CodeBlockProcessors';

import 'packages/obsidian/src/styles.css';
import 'virtual:ec-styles.css';
import 'virtual:ec-runtime';

export default class ShikiPlugin extends Plugin {
	store!: SettingsStore;
	highlighter!: CodeHighlighter;
	renderTargets!: RenderTargets;
	private settingTab!: ShikiSettingsTab;
	private codeBlockProcessors!: CodeBlockProcessors<MarkdownPostProcessor>;

	// settings edits and css-change both land here; a burst of them becomes one reload
	private readonly scheduleReload = debounce(
		() => {
			void this.renderTargets.reload();
		},
		1000,
		true,
	);

	async onload(): Promise<void> {
		await this.loadSettings();

		this.highlighter = new CodeHighlighter(this);
		await this.highlighter.load();

		this.renderTargets = new RenderTargets({
			reloadHighlighter: (): Promise<void> => this.highlighter.reload(),
			afterReload: (): void => this.afterHighlighterReload(),
		});

		this.settingTab = new ShikiSettingsTab(this, this.store, this.highlighter, {
			scheduleReload: (): void => {
				this.scheduleReload();
			},
		});
		this.addSettingTab(this.settingTab);
		this.register(() => this.scheduleReload.cancel());

		this.registerInlineCodeProcessor();
		this.codeBlockProcessors = new CodeBlockProcessors({
			create: (language): MarkdownPostProcessor => this.createCodeBlockProcessor(language),
			register: (processor): void => MarkdownPreviewRenderer.registerPostProcessor(processor, 1000),
			unregister: (processor): void => MarkdownPreviewRenderer.unregisterPostProcessor(processor),
		});
		this.codeBlockProcessors.sync(this.highlighter.obsidianSafeLanguageNames());
		this.register(() => this.codeBlockProcessors.clear());

		this.registerEditorExtension([createCm6Plugin(this.highlighter, this.renderTargets, this.store)]);

		// this is a workaround for the fact that obsidian does not rerender the code block
		// when the start line with the language changes, and we need that for the EC meta string
		this.registerEvent(
			this.app.vault.on('modify', file => {
				if (file instanceof TFile) this.renderTargets.rerenderFor(file.path);
			}),
		);

		this.registerEvent(this.app.workspace.on('css-change', () => this.scheduleReload()));

		this.addCommand({
			id: 'reload-highlighter',
			name: 'Reload highlighter',
			callback: () => {
				this.scheduleReload.cancel();
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

	private createCodeBlockProcessor(language: string): MarkdownPostProcessor {
		return MarkdownPreviewRenderer.createCodeBlockPostProcessor(language, async (source, el, ctx) => {
			// we need to avoid making the hidden frontmatter code block visible
			if (el.parentElement?.classList.contains('mod-frontmatter')) {
				return;
			}

			const codeBlock = new CodeBlock(this.highlighter, this.renderTargets, el, source, language, ctx);

			ctx.addChild(codeBlock);
		});
	}

	/** Runs after each highlighter reload, before render targets refresh; never after unload. */
	private afterHighlighterReload(): void {
		// excluded or custom languages may have changed: blocks of an added language are still
		// Obsidian's plain code blocks, so only a full rerender of reading views picks them up
		if (this.codeBlockProcessors.sync(this.highlighter.obsidianSafeLanguageNames())) {
			for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
				if (leaf.view instanceof MarkdownView) leaf.view.previewMode.rerender(true);
			}
		}
		// custom themes are reread on load, so the theme dropdowns need re-evaluating
		this.settingTab.update();
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
		this.scheduleReload.cancel();
		// a reload still running would rebuild the engine after this unload; let it finish first
		void this.renderTargets.dispose().then(() => this.highlighter.unload());
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
