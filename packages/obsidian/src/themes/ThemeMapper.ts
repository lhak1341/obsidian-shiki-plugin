import { type BundledTheme, bundledThemes, type ThemeRegistration } from 'shiki';
import { OBSIDIAN_THEME } from 'packages/ec-core/src/ObsidianTheme';
import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';

export interface ThemeContext {
	isDarkMode: boolean;
	darkTheme: string;
	lightTheme: string;
	customThemes: { name: string }[];
}

export class ThemeMapper {
	private ctx: ThemeContext;

	constructor(ctx: ThemeContext) {
		this.ctx = ctx;
	}

	async getTheme(): Promise<ThemeRegistration> {
		const activeTheme = this.getThemeIdentifier();

		if (this.usingCustomTheme()) {
			return this.ctx.customThemes.find(theme => theme.name === activeTheme) as ThemeRegistration;
		} else if (!this.usingObsidianTheme()) {
			const loader = bundledThemes[activeTheme as BundledTheme];
			if (!loader) {
				// bundled theme was renamed or removed in a shiki upgrade; fall back safely
				console.warn(`Shiki bundled theme "${activeTheme}" not found, falling back to Obsidian theme`);
				return OBSIDIAN_THEME;
			}
			return (await loader()).default;
		}

		return OBSIDIAN_THEME;
	}

	getThemeIdentifier(): string {
		return this.ctx.isDarkMode ? this.ctx.darkTheme : this.ctx.lightTheme;
	}

	usingObsidianTheme(): boolean {
		return this.getThemeIdentifier() === OBSIDIAN_THEME_IDENTIFIER;
	}

	usingCustomTheme(): boolean {
		return this.getThemeIdentifier().endsWith('.json');
	}
}
