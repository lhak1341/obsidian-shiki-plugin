import { type BundledTheme, bundledThemes, type ThemeRegistration } from 'shiki';
import { OBSIDIAN_THEME } from 'packages/ec-core/src/ObsidianTheme';

export const OBSIDIAN_THEME_IDENTIFIER = 'obsidian-theme';

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
			return (await bundledThemes[activeTheme as BundledTheme]()).default;
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
