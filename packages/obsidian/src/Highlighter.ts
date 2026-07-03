import { type LanguageRegistration, type TokensResult, type ThemedToken } from 'shiki';
import { ThemeMapper, type ThemeContext } from 'packages/obsidian/src/themes/ThemeMapper';
import { normalizePath, Notice } from 'obsidian';
import { EcRenderer } from 'packages/obsidian/src/EcRenderer';
import { type EcSettingsProps } from 'packages/ec-core/src/Config';
import { ShikiRenderer } from 'packages/obsidian/src/ShikiRenderer';

interface HighlighterHost {
	isDarkMode(): boolean;
	vaultExists(path: string): Promise<boolean>;
	vaultList(path: string): Promise<{ files: string[] }>;
	vaultRead(path: string): Promise<string>;
	readonly pluginName: string;
	readonly darkTheme: string;
	readonly lightTheme: string;
	readonly customThemeFolder: string;
	readonly customLanguageFolder: string;
	readonly disabledLanguages: readonly string[];
	readonly ecSettings: EcSettingsProps;
	resetTheme(which: 'dark' | 'light'): Promise<void>;
	refreshSettings(): void;
}

export interface CustomTheme {
	name: string;
	displayName: string;
	type: string;
	colors?: Record<string, unknown>[];
	tokenColors?: Record<string, unknown>[];
}

// some languages break obsidian's `registerMarkdownCodeBlockProcessor`
const LANGUAGE_DENYLIST = new Set(['c++', 'c#', 'f#', 'mermaid']);

export class CodeHighlighter {
	private readonly host: HighlighterHost;
	private ecRenderer: EcRenderer;
	private shikiRenderer: ShikiRenderer;

	private customThemes!: CustomTheme[];
	private customLanguages!: LanguageRegistration[];

	constructor(host: HighlighterHost) {
		this.host = host;
		this.ecRenderer = new EcRenderer();
		this.shikiRenderer = new ShikiRenderer();
	}

	get supportedLanguages(): string[] {
		return this.shikiRenderer.supportedLanguages;
	}

	getCustomThemes(): CustomTheme[] {
		return this.customThemes;
	}

	async load(): Promise<void> {
		await this.loadCustomThemes();
		await this.loadCustomLanguages();

		const themeMapper = new ThemeMapper({
			isDarkMode: this.host.isDarkMode(),
			darkTheme: this.host.darkTheme,
			lightTheme: this.host.lightTheme,
			customThemes: this.customThemes,
		} satisfies ThemeContext);

		await this.ecRenderer.load(themeMapper, this.customLanguages, this.host.ecSettings);
		await this.shikiRenderer.load(themeMapper, this.customLanguages);
	}

	async reload(): Promise<void> {
		await this.unload();
		this.host.refreshSettings();
		await this.load();
	}

	async unload(): Promise<void> {
		this.ecRenderer.unload();
		this.shikiRenderer.unload();
	}

	private async listJsonFiles(folder: string, kind: string): Promise<string[]> {
		const normalized = normalizePath(folder);
		if (!(await this.host.vaultExists(normalized))) {
			new Notice(`${this.host.pluginName}\nUnable to open custom ${kind} folder: ${normalized}`, 5000);
			return [];
		}
		const listing = await this.host.vaultList(normalized);
		return listing.files.filter(f => f.toLowerCase().endsWith('.json'));
	}

	async loadCustomLanguages(): Promise<void> {
		this.customLanguages = [];

		if (!this.host.customLanguageFolder) return;

		const languageFiles = await this.listJsonFiles(this.host.customLanguageFolder, 'languages');

		for (const languageFile of languageFiles) {
			try {
				const language = JSON.parse(await this.host.vaultRead(languageFile)) as LanguageRegistration;
				// validate that language file JSON can be parsed and contains at a minimum a scopeName
				if (!language.name) {
					throw Error('Invalid JSON language file is missing a name property.');
				}

				this.customLanguages.push(language);
			} catch (e) {
				new Notice(`${this.host.pluginName}\nUnable to load custom language: ${languageFile}`, 5000);
				console.warn(`Unable to load custom language: ${languageFile}`, e);
			}
		}
	}

	async loadCustomThemes(): Promise<void> {
		const activeTheme = this.host.isDarkMode()
			? this.host.darkTheme
			: this.host.lightTheme;
		this.customThemes = [];

		// custom themes are disabled unless users specify a folder for them in plugin settings
		if (!this.host.customThemeFolder) return;

		const themeFolder = normalizePath(this.host.customThemeFolder);
		const themeFiles = await this.listJsonFiles(this.host.customThemeFolder, 'themes');

		for (const themeFile of themeFiles) {
			const baseName = themeFile.substring(`${themeFolder}/`.length);
			try {
				const theme = JSON.parse(await this.host.vaultRead(themeFile)) as CustomTheme;
				// validate that theme file JSON can be parsed and contains colors at a minimum
				if (!theme.colors && !theme.tokenColors) {
					throw Error('Invalid JSON theme file.');
				}
				// what metadata is available in the theme file depends on how it was created
				theme.displayName = theme.displayName ?? theme.name ?? baseName;
				theme.name = baseName.toLowerCase();
				theme.type = theme.type ?? 'both';

				this.customThemes.push(theme);
			} catch (e) {
				new Notice(`${this.host.pluginName}\nUnable to load custom theme: ${themeFile}`, 5000);
				console.warn(`Unable to load custom theme: ${themeFile}`, e);
			}
		}

		// if either mode's custom theme cannot be loaded (e.g. it was deleted), fall back to default.
		// check both modes so a mode-switch after the folder is emptied doesn't crash on load.
		for (const mode of ['dark', 'light'] as const) {
			const themeId = mode === 'dark' ? this.host.darkTheme : this.host.lightTheme;
			if (themeId.endsWith('.json') && !this.customThemes.find(t => t.name === themeId)) {
				await this.host.resetTheme(mode);
			}
		}

		this.customThemes.sort((a, b) => a.displayName.localeCompare(b.displayName));
	}

	/**
	 * All languages that are safe to use with Obsidian's `registerMarkdownCodeBlockProcessor`.
	 */
	obsidianSafeLanguageNames(): string[] {
		return this.shikiRenderer.supportedLanguages.filter(
			lang => !LANGUAGE_DENYLIST.has(lang) && !this.host.disabledLanguages.includes(lang),
		);
	}

	async renderWithEc(code: string, language: string, meta: string, container: HTMLElement): Promise<void> {
		return this.ecRenderer.render(code, language, meta, container);
	}

	async getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined> {
		if (!this.obsidianSafeLanguageNames().includes(lang)) {
			return undefined;
		}
		return this.shikiRenderer.tokenize(code, lang);
	}

	renderTokens(tokens: ThemedToken[], parent: HTMLElement): void {
		this.shikiRenderer.renderTokens(tokens, parent);
	}

	getTokenStyle(token: ThemedToken): { style: string; classes: string[] } {
		return this.shikiRenderer.getTokenStyle(token);
	}
}
