import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';
import { EC_DEFAULT_SETTINGS, type EcSettingsProps, FrameType } from 'packages/ec-core/src/Config';

export { FrameType };

export interface Settings extends EcSettingsProps {
	disabledLanguages: readonly string[];
	customThemeFolder: string;
	customLanguageFolder: string;
	/**
	 * Old theme setting, from before we had separate light/dark theme settings. Will me migrated on load.
	 */
	theme: string | undefined;
	darkTheme: string;
	lightTheme: string;
	inlineHighlighting: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	disabledLanguages: [],
	customThemeFolder: '',
	customLanguageFolder: '',
	theme: undefined,
	darkTheme: OBSIDIAN_THEME_IDENTIFIER,
	lightTheme: OBSIDIAN_THEME_IDENTIFIER,
	inlineHighlighting: true,
	...EC_DEFAULT_SETTINGS,
};

/**
 * Settings that take effect without a highlighter reload. `SettingsStore.update` writes these
 * straight into the snapshot; every other setting waits for the next reload.
 */
export const LIVE_SETTINGS: ReadonlySet<keyof Settings> = new Set<keyof Settings>(['inlineHighlighting']);
