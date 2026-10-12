import { type BundledTheme, bundledThemes, type ThemeRegistration } from 'shiki';
import { OBSIDIAN_THEME } from 'packages/ec-core/src/ObsidianTheme';
import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';

export interface ThemeContext {
	isDarkMode: boolean;
	darkTheme: string;
	lightTheme: string;
	customThemes: { name: string }[];
}

/**
 * The theme in effect, as one value. `registration`, `identifier` and `usingObsidianTheme` always
 * agree: a renderer that loads `registration` can ask shiki for `identifier`, and `ec-core`'s
 * `createEcEngine` applies the CSS-variable encoding exactly when `usingObsidianTheme` is true.
 */
export interface ResolvedTheme {
	registration: ThemeRegistration;
	identifier: string;
	usingObsidianTheme: boolean;
}

const OBSIDIAN: ResolvedTheme = { registration: OBSIDIAN_THEME, identifier: OBSIDIAN_THEME_IDENTIFIER, usingObsidianTheme: true };

/**
 * Resolves the active theme setting. An id that cannot be resolved (a bundled theme renamed or
 * removed by a shiki upgrade, or a custom theme file that is gone) falls back to the Obsidian
 * theme in memory; the stored setting is left alone.
 */
export async function resolveTheme(ctx: ThemeContext): Promise<ResolvedTheme> {
	const identifier = ctx.isDarkMode ? ctx.darkTheme : ctx.lightTheme;

	if (identifier === OBSIDIAN_THEME_IDENTIFIER) return OBSIDIAN;

	if (identifier.endsWith('.json')) {
		const custom = ctx.customThemes.find(theme => theme.name === identifier);
		if (!custom) {
			console.warn(`Custom theme "${identifier}" not found, falling back to Obsidian theme`);
			return OBSIDIAN;
		}
		return { registration: custom, identifier, usingObsidianTheme: false };
	}

	const loader = bundledThemes[identifier as BundledTheme];
	if (!loader) {
		console.warn(`Shiki bundled theme "${identifier}" not found, falling back to Obsidian theme`);
		return OBSIDIAN;
	}
	return { registration: (await loader()).default, identifier, usingObsidianTheme: false };
}
