import type { LanguageRegistration } from 'shiki';
import type { ResolvedTheme } from 'packages/obsidian/src/themes/ResolveTheme';
import { toDom } from 'hast-util-to-dom';
import { type EcSettingsProps } from 'packages/ec-core/src/Config';
import { createEcEngine, type EcEngine } from 'packages/ec-core/src/EcEngine';

export class EcRenderer {
	private ec!: EcEngine;
	private ecStyleElement: HTMLElement | undefined;

	async load(theme: ResolvedTheme, customLanguages: LanguageRegistration[], settings: EcSettingsProps): Promise<void> {
		this.ec = createEcEngine({ theme, customLanguages, settings });

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
		const ast = await this.ec.render({ code, language, meta });
		container.empty();
		container.append(toDom(ast));
	}
}
