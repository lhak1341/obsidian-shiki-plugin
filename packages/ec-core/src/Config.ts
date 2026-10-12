export enum FrameType {
	Code = 'code',
	Terminal = 'terminal',
	None = 'none',
	Auto = 'auto',
}

export interface EcSettingsProps {
	preferThemeColors: boolean;
	ecDefaultShowLineNumbers: boolean;
	ecDefaultWrap: boolean;
	ecDefaultFrame: FrameType;
}

/**
 * The EC part of the plugin's default settings. The build also passes these to `createEcEngine`,
 * only because the engine needs settings: its base styles and scripts do not depend on them.
 */
export const EC_DEFAULT_SETTINGS: EcSettingsProps = {
	preferThemeColors: true,
	ecDefaultShowLineNumbers: false,
	ecDefaultWrap: false,
	ecDefaultFrame: FrameType.Auto,
};
