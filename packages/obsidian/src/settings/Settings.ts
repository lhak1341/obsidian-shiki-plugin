import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';
import { type EcSettingsProps, FrameType } from 'packages/ec-core/src/Config';

export { FrameType };

export interface Settings {
	disabledLanguages: readonly string[];
	customThemeFolder: string;
	customLanguageFolder: string;
	/**
	 * Old theme setting, from before we had separate light/dark theme settings. Will me migrated on load.
	 */
	theme: string | undefined;
	darkTheme: string;
	lightTheme: string;
	preferThemeColors: boolean;
	inlineHighlighting: boolean;
	ecDefaultShowLineNumbers: boolean;
	ecDefaultWrap: boolean;
	ecDefaultFrame: FrameType;
}

export const DEFAULT_SETTINGS: Settings = {
	disabledLanguages: [],
	customThemeFolder: '',
	customLanguageFolder: '',
	theme: undefined,
	darkTheme: OBSIDIAN_THEME_IDENTIFIER,
	lightTheme: OBSIDIAN_THEME_IDENTIFIER,
	preferThemeColors: true,
	inlineHighlighting: true,
	ecDefaultShowLineNumbers: false,
	ecDefaultWrap: false,
	ecDefaultFrame: FrameType.Auto,
};

// compile-time: enforces Settings stays structurally compatible with EcSettingsProps
void (DEFAULT_SETTINGS satisfies EcSettingsProps);
