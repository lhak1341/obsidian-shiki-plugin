import { ExpressiveCodeEngine } from '@expressive-code/core';
import {
	bundledLanguages,
	createHighlighter,
	type LanguageRegistration,
	type Highlighter,
	type TokensResult,
	type BundledLanguage,
	type ThemedToken,
} from 'shiki';
import { ThemeMapper, type ThemeContext } from 'packages/obsidian/src/themes/ThemeMapper';
import { normalizePath, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, type Settings } from 'packages/obsidian/src/settings/Settings';
import { toDom } from 'hast-util-to-dom';
import { createEcEngineConfig } from 'packages/ec-core/src/Config';
import { encodeCssVarTheme } from 'packages/ec-core/src/CssVarThemeAdapter';

interface HighlighterHost {
	isDarkMode(): boolean;
	vaultExists(path: string): Promise<boolean>;
	vaultList(path: string): Promise<{ files: string[] }>;
	vaultRead(path: string): Promise<string>;
	readonly pluginName: string;
	readonly loadedSettings: Settings;
	resetTheme(which: 'dark' | 'light'): Promise<void>;
}

interface CustomTheme {
	name: string;
	displayName: string;
	type: string;
	colors?: Record<string, unknown>[];
	tokenColors?: Record<string, unknown>[];
}

// some languages break obsidian's `registerMarkdownCodeBlockProcessor`, so we blacklist them
const LANGUAGE_BLACKLIST = new Set(['c++', 'c#', 'f#', 'mermaid']);

// some languages are considered "special" by shiki.isSpecialLang
const LANGUAGE_SPECIAL = new Set(['plaintext', 'txt', 'text', 'plain', 'ansi']);

export class CodeHighlighter {
	host: HighlighterHost;
	themeMapper!: ThemeMapper;

	ec!: ExpressiveCodeEngine;
	ecStyleElement: HTMLElement | undefined;
	cssVarAdapter: ReturnType<typeof encodeCssVarTheme> | null = null;
	supportedLanguages!: string[];
	shiki!: Highlighter;
	customThemes!: CustomTheme[];
	customLanguages!: LanguageRegistration[];

	constructor(host: HighlighterHost) {
		this.host = host;
	}

	async load(): Promise<void> {
		await this.loadCustomThemes();
		await this.loadCustomLanguages();

		this.themeMapper = new ThemeMapper({
			isDarkMode: this.host.isDarkMode(),
			darkTheme: this.host.loadedSettings.darkTheme,
			lightTheme: this.host.loadedSettings.lightTheme,
			customThemes: this.customThemes,
		} satisfies ThemeContext);

		await this.loadEC();
		await this.loadShiki();

		this.supportedLanguages = [...Object.keys(bundledLanguages), ...LANGUAGE_SPECIAL, ...this.customLanguages.map(i => i.name)];
	}

	async unload(): Promise<void> {
		this.unloadEC();
		this.unloadShiki();
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

		if (!this.host.loadedSettings.customLanguageFolder) return;

		const languageFiles = await this.listJsonFiles(this.host.loadedSettings.customLanguageFolder, 'languages');

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
			? this.host.loadedSettings.darkTheme
			: this.host.loadedSettings.lightTheme;
		this.customThemes = [];

		// custom themes are disabled unless users specify a folder for them in plugin settings
		if (!this.host.loadedSettings.customThemeFolder) return;

		const themeFolder = normalizePath(this.host.loadedSettings.customThemeFolder);
		const themeFiles = await this.listJsonFiles(this.host.loadedSettings.customThemeFolder, 'themes');

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

		// if the user's set theme cannot be loaded (e.g. it was deleted), fall back to default theme
		if (activeTheme.endsWith('.json') && !this.customThemes.find(theme => theme.name === activeTheme)) {
			if (activeTheme === this.host.loadedSettings.darkTheme) {
				await this.host.resetTheme('dark');
			} else if (activeTheme === this.host.loadedSettings.lightTheme) {
				await this.host.resetTheme('light');
			}
		}

		this.customThemes.sort((a, b) => a.displayName.localeCompare(b.displayName));
	}

	async loadEC(): Promise<void> {
		const rawTheme = await this.themeMapper.getTheme();
		const usingObsidianTheme = this.themeMapper.usingObsidianTheme();

		this.cssVarAdapter = usingObsidianTheme ? encodeCssVarTheme(rawTheme) : null;

		this.ec = new ExpressiveCodeEngine(
			createEcEngineConfig({
				theme: this.cssVarAdapter?.theme ?? rawTheme,
				customLanguages: this.customLanguages,
				settings: this.host.loadedSettings,
				usingObsidianTheme,
			}),
		);

		// Since they come directly from EC, and depend on runtime settings/theme selection, there is no other way than to attach them dynamically.
		// Note that the static EC styles and scripts are bundled with the plugin and don't need to be loaded like this.
		const themeStyles = await this.ec.getThemeStyles();

		// Insert new style before removing old to avoid a gap where EC CSS is absent,
		// which would cause code blocks to briefly lose wrap and other visual options.
		// eslint-disable-next-line obsidianmd/no-forbidden-elements
		const newStyleEl = activeDocument.head.createEl('style', { text: themeStyles });
		this.ecStyleElement?.remove();
		this.ecStyleElement = newStyleEl;
	}

	unloadEC(): void {
		if (this.ecStyleElement) {
			this.ecStyleElement.remove();
			this.ecStyleElement = undefined;
		}
	}

	async loadShiki(): Promise<void> {
		this.shiki = await createHighlighter({
			themes: [await this.themeMapper.getTheme()],
			langs: this.customLanguages,
		});
	}

	unloadShiki(): void {
		this.shiki.dispose();
	}

	/**
	 * All languages that are safe to use with Obsidian's `registerMarkdownCodeBlockProcessor`.
	 */
	obsidianSafeLanguageNames(): string[] {
		return this.supportedLanguages.filter(lang => !LANGUAGE_BLACKLIST.has(lang) && !this.host.loadedSettings.disabledLanguages.includes(lang));
	}

	/**
	 * Highlights code with EC and renders it to the passed container element.
	 */
	async renderWithEc(code: string, language: string, meta: string, container: HTMLElement): Promise<void> {
		const result = await this.ec.render({
			code,
			language,
			meta,
		});

		const ast = result.renderedGroupAst;
		this.cssVarAdapter?.decodeHast(ast);
		container.empty();
		container.append(toDom(ast));
	}

	async getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined> {
		if (!this.obsidianSafeLanguageNames().includes(lang)) {
			return undefined;
		}
		// load bundled language when needed
		if (!this.shiki.getLoadedLanguages().includes(lang)) {
			await this.shiki.loadLanguage(lang as BundledLanguage);
		}
		return this.shiki.codeToTokens(code, {
			lang: lang as BundledLanguage,
			theme: this.themeMapper.getThemeIdentifier(),
		});
	}

	renderTokens(tokens: ThemedToken[], parent: HTMLElement): void {
		for (const token of tokens) {
			this.tokenToSpan(token, parent);
		}
	}

	tokenToSpan(token: ThemedToken, parent: HTMLElement): void {
		const tokenStyle = this.getTokenStyle(token);
		parent.createSpan({
			text: token.content,
			cls: tokenStyle.classes.join(' '),
			attr: { style: tokenStyle.style },
		});
	}

	getTokenStyle(token: ThemedToken): { style: string; classes: string[] } {
		const fontStyle = token.fontStyle ?? 0;

		return {
			style: `color: ${token.color}`,
			classes: [
				(fontStyle & 1) !== 0 ? 'shiki-italic' : undefined,
				(fontStyle & 2) !== 0 ? 'shiki-bold' : undefined,
				(fontStyle & 4) !== 0 ? 'shiki-ul' : undefined,
			].filter(Boolean) as string[],
		};
	}
}
