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
	supportedLanguages!: string[];

	async load(themeMapper: ThemeMapper, customLanguages: LanguageRegistration[]): Promise<void> {
		this.themeMapper = themeMapper;
		this.shiki = await createHighlighter({
			themes: [await themeMapper.getTheme()],
			langs: customLanguages,
		});
		this.supportedLanguages = [...Object.keys(bundledLanguages), ...LANGUAGE_SPECIAL, ...customLanguages.map(i => i.name)];
	}

	unload(): void {
		this.shiki.dispose();
	}

	async tokenize(code: string, lang: string): Promise<TokensResult | undefined> {
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
