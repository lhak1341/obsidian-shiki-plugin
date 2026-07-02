import { ExpressiveCodeTheme, type ExpressiveCodeEngineConfig } from '@expressive-code/core';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginFrames } from '@expressive-code/plugin-frames';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { pluginShiki } from '@expressive-code/plugin-shiki';
import { pluginTextMarkers } from '@expressive-code/plugin-text-markers';
import { type LanguageRegistration, type ThemeRegistration } from 'shiki';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths -- needed for vite to load this correctly
import { getECTheme } from './ECTheme';

export interface EcSettingsProps {
	preferThemeColors: boolean;
	ecDefaultShowLineNumbers: boolean;
	ecDefaultWrap: boolean;
	ecDefaultFrame: 'code' | 'terminal' | 'none' | 'auto';
}

export interface EcConfigInput {
	theme: ThemeRegistration;
	customLanguages: LanguageRegistration[];
	settings: EcSettingsProps;
	usingObsidianTheme: boolean;
}

export const EC_VIRTUAL_SETTINGS: EcSettingsProps = {
	preferThemeColors: true,
	ecDefaultShowLineNumbers: false,
	ecDefaultWrap: false,
	ecDefaultFrame: 'auto',
};

export function createEcEngineConfig(input: EcConfigInput): ExpressiveCodeEngineConfig {
	const useThemeColors = input.settings.preferThemeColors && !input.usingObsidianTheme;

	return {
		themes: [new ExpressiveCodeTheme(input.theme)],
		plugins: [
			pluginShiki({
				langs: input.customLanguages,
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
			showLineNumbers: input.settings.ecDefaultShowLineNumbers,
			wrap: input.settings.ecDefaultWrap,
			frame: input.settings.ecDefaultFrame,
		},
	};
}
