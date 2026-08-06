import { describe, test, expect } from 'bun:test';
import { ThemeMapper, type ThemeContext } from 'packages/obsidian/src/themes/ThemeMapper';
import { OBSIDIAN_THEME } from 'packages/ec-core/src/ObsidianTheme';
import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';
import { bundledThemes } from 'shiki';

// Helpers

function makeCtx(overrides: Partial<ThemeContext>): ThemeContext {
	return {
		isDarkMode: true,
		darkTheme: OBSIDIAN_THEME_IDENTIFIER,
		lightTheme: OBSIDIAN_THEME_IDENTIFIER,
		customThemes: [],
		...overrides,
	};
}

// Tests

describe('ThemeMapper', () => {
	test('getThemeIdentifier uses darkTheme when isDarkMode', () => {
		const mapper = new ThemeMapper(makeCtx({ isDarkMode: true, darkTheme: 'dark-id', lightTheme: 'light-id' }));
		expect(mapper.getThemeIdentifier()).toBe('dark-id');
	});

	test('getThemeIdentifier uses lightTheme when not isDarkMode', () => {
		const mapper = new ThemeMapper(makeCtx({ isDarkMode: false, darkTheme: 'dark-id', lightTheme: 'light-id' }));
		expect(mapper.getThemeIdentifier()).toBe('light-id');
	});

	test('usingObsidianTheme is true iff identifier is the Obsidian theme identifier', () => {
		const obsidian = new ThemeMapper(makeCtx({ darkTheme: OBSIDIAN_THEME_IDENTIFIER }));
		const other = new ThemeMapper(makeCtx({ darkTheme: 'something-else' }));
		expect(obsidian.usingObsidianTheme()).toBe(true);
		expect(other.usingObsidianTheme()).toBe(false);
	});

	test('usingCustomTheme is true iff identifier ends with .json', () => {
		const custom = new ThemeMapper(makeCtx({ darkTheme: 'my-theme.json' }));
		const other = new ThemeMapper(makeCtx({ darkTheme: 'github-dark' }));
		expect(custom.usingCustomTheme()).toBe(true);
		expect(other.usingCustomTheme()).toBe(false);
	});

	test('getTheme returns OBSIDIAN_THEME when using the Obsidian theme identifier', async () => {
		const mapper = new ThemeMapper(makeCtx({ darkTheme: OBSIDIAN_THEME_IDENTIFIER }));
		expect(await mapper.getTheme()).toBe(OBSIDIAN_THEME);
	});

	test('getTheme returns the matching custom theme by name', async () => {
		const marker = { name: 'my-theme.json', colors: {} };
		const mapper = new ThemeMapper(makeCtx({ darkTheme: 'my-theme.json', customThemes: [marker] }));
		expect(await mapper.getTheme()).toBe(marker as never);
	});

	test('getTheme loads a real bundled theme', async () => {
		const [bundledName] = Object.keys(bundledThemes);
		const mapper = new ThemeMapper(makeCtx({ darkTheme: bundledName }));
		const theme = await mapper.getTheme();
		expect(theme).toBeDefined();
		expect(theme.colors ?? theme.tokenColors).toBeTruthy();
	});

	test('getTheme falls back to OBSIDIAN_THEME when the bundled theme is not found', async () => {
		const mapper = new ThemeMapper(makeCtx({ darkTheme: 'definitely-not-a-real-theme' }));
		expect(await mapper.getTheme()).toBe(OBSIDIAN_THEME);
	});
});
