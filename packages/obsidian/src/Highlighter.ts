import { type LanguageRegistration, type TokensResult, type ThemedToken } from 'shiki';
import { type CustomAssetsHost, type CustomTheme, loadCustomAssets } from 'packages/obsidian/src/CustomAssets';
import { resolveTheme, type ThemeContext } from 'packages/obsidian/src/themes/ResolveTheme';
import { EcRenderer } from 'packages/obsidian/src/EcRenderer';
import { type EcSettingsProps } from 'packages/ec-core/src/Config';
import { ShikiRenderer } from 'packages/obsidian/src/ShikiRenderer';
import type { Settings } from 'packages/obsidian/src/settings/Settings';

// opt-in: a setting is only visible to CodeHighlighter once its key is added here
type HighlighterSettings = Readonly<
	Pick<Settings, 'darkTheme' | 'lightTheme' | 'customThemeFolder' | 'customLanguageFolder' | 'disabledLanguages' | keyof EcSettingsProps>
>;

interface HighlighterHost extends CustomAssetsHost {
	isDarkMode(): boolean;
	/** The engine's active view (snapshot), re-read on every access: it is replaced on flush. */
	readonly engineSettings: HighlighterSettings;
	resetTheme(which: 'dark' | 'light'): Promise<void>;
	refreshSettings(): void;
}

// some languages break obsidian's `registerMarkdownCodeBlockProcessor`
const LANGUAGE_DENYLIST = new Set(['c++', 'c#', 'f#', 'mermaid']);

/**
 * All languages that are safe to use with Obsidian's `registerMarkdownCodeBlockProcessor`.
 */
export function safeLanguageNames(supported: readonly string[], disabled: readonly string[]): string[] {
	return supported.filter(lang => !LANGUAGE_DENYLIST.has(lang) && !disabled.includes(lang));
}

export class CodeHighlighter {
	private readonly host: HighlighterHost;
	private ecRenderer: EcRenderer;
	private shikiRenderer: ShikiRenderer;

	private customThemes!: CustomTheme[];
	private customLanguages!: LanguageRegistration[];

	// disabledLanguages is a reload-required setting, so the filtered list only changes in load()
	private safeLanguages: readonly string[] = [];
	private safeLanguageSet = new Set<string>();

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
		const assets = await loadCustomAssets(this.host, {
			themeFolder: this.host.engineSettings.customThemeFolder,
			languageFolder: this.host.engineSettings.customLanguageFolder,
			darkTheme: this.host.engineSettings.darkTheme,
			lightTheme: this.host.engineSettings.lightTheme,
		});
		this.customThemes = assets.themes;
		this.customLanguages = assets.languages;
		for (const mode of assets.modesToReset) {
			await this.host.resetTheme(mode);
		}

		const theme = await resolveTheme({
			isDarkMode: this.host.isDarkMode(),
			darkTheme: this.host.engineSettings.darkTheme,
			lightTheme: this.host.engineSettings.lightTheme,
			customThemes: this.customThemes,
		} satisfies ThemeContext);

		await this.ecRenderer.load(theme, this.customLanguages, this.host.engineSettings);
		await this.shikiRenderer.load(theme, this.customLanguages);

		this.safeLanguages = safeLanguageNames(this.shikiRenderer.supportedLanguages, this.host.engineSettings.disabledLanguages);
		this.safeLanguageSet = new Set(this.safeLanguages);
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

	obsidianSafeLanguageNames(): readonly string[] {
		return this.safeLanguages;
	}

	async renderWithEc(code: string, language: string, meta: string, container: HTMLElement): Promise<void> {
		return this.ecRenderer.render(code, language, meta, container);
	}

	async getHighlightTokens(code: string, lang: string): Promise<TokensResult | undefined> {
		if (!this.safeLanguageSet.has(lang)) {
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
