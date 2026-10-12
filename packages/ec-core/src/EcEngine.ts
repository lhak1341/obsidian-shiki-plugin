import { ExpressiveCodeEngine, ExpressiveCodeTheme, type ExpressiveCodeEngineConfig } from '@expressive-code/core';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginFrames } from '@expressive-code/plugin-frames';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { pluginShiki } from '@expressive-code/plugin-shiki';
import { pluginTextMarkers } from '@expressive-code/plugin-text-markers';
import type * as hast_types from 'hast';
import { type LanguageRegistration, type ThemeRegistration } from 'shiki';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths -- needed for vite to load this correctly
import { type EcSettingsProps } from './Config';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths -- needed for vite to load this correctly
import { encodeCssVarTheme } from './CssVarThemeAdapter';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths -- needed for vite to load this correctly
import { getECTheme } from './ECTheme';

/** The theme to render with. `packages/obsidian`'s `ResolvedTheme` satisfies this structurally. */
export interface EcThemeInput {
	registration: ThemeRegistration;
	/** The Obsidian theme colours with CSS variables, which EC cannot parse; they are encoded and decoded inside the engine. */
	usingObsidianTheme: boolean;
}

export interface EcEngineInput {
	theme: EcThemeInput;
	customLanguages: LanguageRegistration[];
	settings: EcSettingsProps;
}

/**
 * An Expressive Code engine whose outputs carry no CSS-variable placeholder. Base styles never
 * contain theme colours, so only theme styles and rendered blocks are decoded.
 */
export interface EcEngine {
	getBaseStyles(): Promise<string>;
	getThemeStyles(): Promise<string>;
	getJsModules(): Promise<string[]>;
	render(input: { code: string; language: string; meta: string }): Promise<hast_types.Element>;
}

/** Creates the EC engine for both the build (static styles and scripts) and the plugin runtime (theme styles and rendering). */
export function createEcEngine(input: EcEngineInput): EcEngine {
	const { registration, usingObsidianTheme } = input.theme;
	const adapter = usingObsidianTheme ? encodeCssVarTheme(registration) : null;
	const decodeString = (css: string): string => adapter?.decodeString(css) ?? css;

	const ec = new ExpressiveCodeEngine(createEcEngineConfig(adapter?.theme ?? registration, input.customLanguages, input.settings, usingObsidianTheme));

	return {
		getBaseStyles: (): Promise<string> => ec.getBaseStyles(),
		getThemeStyles: async (): Promise<string> => decodeString(await ec.getThemeStyles()),
		getJsModules: (): Promise<string[]> => ec.getJsModules(),
		render: async ({ code, language, meta }): Promise<hast_types.Element> => {
			const ast = (await ec.render({ code, language, meta })).renderedGroupAst;
			adapter?.decodeHast(ast);
			return ast;
		},
	};
}

function createEcEngineConfig(
	theme: ThemeRegistration,
	customLanguages: LanguageRegistration[],
	settings: EcSettingsProps,
	usingObsidianTheme: boolean,
): ExpressiveCodeEngineConfig {
	// the Obsidian theme's colours are CSS variables already, so EC's style overrides must not replace them
	const useThemeColors = settings.preferThemeColors && !usingObsidianTheme;

	return {
		themes: [new ExpressiveCodeTheme(theme)],
		plugins: [
			pluginShiki({
				langs: customLanguages,
			}),
			pluginCollapsibleSections(),
			pluginTextMarkers(),
			pluginLineNumbers(),
			pluginFrames(),
		],
		styleOverrides: getECTheme(useThemeColors),
		minSyntaxHighlightingColorContrast: 0,
		themeCssRoot: 'div.expressive-code',
		defaultProps: {
			showLineNumbers: settings.ecDefaultShowLineNumbers,
			wrap: settings.ecDefaultWrap,
			frame: settings.ecDefaultFrame,
		},
	};
}
