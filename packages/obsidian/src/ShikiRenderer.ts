import {
	bundledLanguages,
	createHighlighter,
	type LanguageRegistration,
	type Highlighter,
	type TokensResult,
	type BundledLanguage,
	type ThemedToken,
} from 'shiki';
import type { ThemeMapper } from 'packages/obsidian/src/themes/ThemeMapper';

// some languages are considered "special" by shiki.isSpecialLang
const LANGUAGE_SPECIAL = new Set(['plaintext', 'txt', 'text', 'plain', 'ansi']);

export class ShikiRenderer {
	private shiki!: Highlighter;
	private themeMapper!: ThemeMapper;
	private loadingLanguages = new Map<string, Promise<void>>();
	supportedLanguages!: string[];

	async load(themeMapper: ThemeMapper, customLanguages: LanguageRegistration[]): Promise<void> {
		this.themeMapper = themeMapper;
		this.loadingLanguages = new Map();
		this.shiki = await createHighlighter({
			themes: [await themeMapper.getTheme()],
			langs: customLanguages,
		});
		this.supportedLanguages = [...Object.keys(bundledLanguages), ...LANGUAGE_SPECIAL, ...customLanguages.map(i => i.name)];
	}

	unload(): void {
		this.shiki.dispose();
		this.loadingLanguages.clear();
	}

	async tokenize(code: string, lang: string): Promise<TokensResult | undefined> {
		if (!this.shiki.getLoadedLanguages().includes(lang)) {
			let loading = this.loadingLanguages.get(lang);
			if (!loading) {
				loading = this.shiki.loadLanguage(lang as BundledLanguage)
					.finally(() => this.loadingLanguages.delete(lang));
				this.loadingLanguages.set(lang, loading);
			}
			try {
				await loading;
			} catch (e) {
				console.warn(`Shiki: failed to load language "${lang}"`, e);
				return undefined;
			}
		}
		try {
			return this.shiki.codeToTokens(code, {
				lang: lang as BundledLanguage,
				theme: this.themeMapper.getThemeIdentifier(),
			});
		} catch (e) {
			console.warn(`Shiki: failed to tokenize code in "${lang}"`, e);
			return undefined;
		}
	}

	renderTokens(tokens: ThemedToken[], parent: HTMLElement): void {
		for (const token of tokens) {
			this.tokenToSpan(token, parent);
		}
	}

	private tokenToSpan(token: ThemedToken, parent: HTMLElement): void {
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
