import { ExpressiveCodeEngine } from '@expressive-code/core';
import type { LanguageRegistration } from 'shiki';
import type { ThemeMapper } from 'packages/obsidian/src/themes/ThemeMapper';
import type { Settings } from 'packages/obsidian/src/settings/Settings';
import { toDom } from 'hast-util-to-dom';
import { createEcEngineConfig } from 'packages/ec-core/src/Config';
import { encodeCssVarTheme } from 'packages/ec-core/src/CssVarThemeAdapter';

export class EcRenderer {
	private ec!: ExpressiveCodeEngine;
	private ecStyleElement: HTMLElement | undefined;
	private cssVarAdapter: ReturnType<typeof encodeCssVarTheme> | null = null;

	async load(themeMapper: ThemeMapper, customLanguages: LanguageRegistration[], settings: Readonly<Settings>): Promise<void> {
		const rawTheme = await themeMapper.getTheme();
		const usingObsidianTheme = themeMapper.usingObsidianTheme();

		this.cssVarAdapter = usingObsidianTheme ? encodeCssVarTheme(rawTheme) : null;

		this.ec = new ExpressiveCodeEngine(
			createEcEngineConfig({
				theme: this.cssVarAdapter?.theme ?? rawTheme,
				customLanguages,
				settings,
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

	unload(): void {
		if (this.ecStyleElement) {
			this.ecStyleElement.remove();
			this.ecStyleElement = undefined;
		}
	}

	async render(code: string, language: string, meta: string, container: HTMLElement): Promise<void> {
		const result = await this.ec.render({ code, language, meta });
		const ast = result.renderedGroupAst;
		this.cssVarAdapter?.decodeHast(ast);
		container.empty();
		container.append(toDom(ast));
	}
}
