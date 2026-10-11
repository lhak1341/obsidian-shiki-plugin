import { describe, test, expect, spyOn } from 'bun:test';
import { bundledThemes, createHighlighter } from 'shiki';
import { ExpressiveCodeEngine } from '@expressive-code/core';
import { resolveTheme, type ResolvedTheme, type ThemeContext } from 'packages/obsidian/src/themes/ResolveTheme';
import { OBSIDIAN_THEME } from 'packages/ec-core/src/ObsidianTheme';
import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';
import { createEcEngineConfig, EC_VIRTUAL_SETTINGS } from 'packages/ec-core/src/Config';
import { encodeCssVarTheme } from 'packages/ec-core/src/CssVarThemeAdapter';

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

const quietly = async <T>(run: () => Promise<T>): Promise<T> => {
	const warn = spyOn(console, 'warn').mockImplementation(() => {});
	try {
		return await run();
	} finally {
		warn.mockRestore();
	}
};

const expectObsidianFallback = (resolved: ResolvedTheme): void => {
	expect(resolved.registration).toBe(OBSIDIAN_THEME);
	expect(resolved.identifier).toBe(OBSIDIAN_THEME_IDENTIFIER);
	expect(resolved.usingObsidianTheme).toBe(true);
};

// mirrors EcRenderer.load: CSS-variable colours are encoded exactly when the Obsidian theme is in use
const ecEngineFor = (resolved: ResolvedTheme): ExpressiveCodeEngine => {
	// shiki normalises a registration it is given in place, so every test works on its own copy
	const registration = structuredClone(resolved.registration);
	const adapter = resolved.usingObsidianTheme ? encodeCssVarTheme(registration) : null;
	return new ExpressiveCodeEngine(
		createEcEngineConfig({
			theme: adapter?.theme ?? registration,
			customLanguages: [],
			settings: EC_VIRTUAL_SETTINGS,
			usingObsidianTheme: resolved.usingObsidianTheme,
		}),
	);
};

// Tests

describe('resolveTheme', () => {
	test('identifier follows isDarkMode', async () => {
		const dark = await resolveTheme(
			makeCtx({ isDarkMode: true, darkTheme: 'a.json', lightTheme: 'b.json', customThemes: [{ name: 'a.json' }, { name: 'b.json' }] }),
		);
		const light = await resolveTheme(
			makeCtx({ isDarkMode: false, darkTheme: 'a.json', lightTheme: 'b.json', customThemes: [{ name: 'a.json' }, { name: 'b.json' }] }),
		);

		expect(dark.identifier).toBe('a.json');
		expect(light.identifier).toBe('b.json');
	});

	test('the Obsidian identifier resolves to OBSIDIAN_THEME', async () => {
		expectObsidianFallback(await resolveTheme(makeCtx({ darkTheme: OBSIDIAN_THEME_IDENTIFIER })));
	});

	test('a found custom theme resolves to that registration under its own id', async () => {
		const marker = { name: 'my-theme.json', colors: {} };
		const resolved = await resolveTheme(makeCtx({ darkTheme: 'my-theme.json', customThemes: [marker] }));

		expect(resolved.registration).toBe(marker as never);
		expect(resolved.identifier).toBe('my-theme.json');
		expect(resolved.usingObsidianTheme).toBe(false);
	});

	test('a .json id missing from customThemes falls back to the Obsidian theme', async () => {
		const resolved = await quietly(() => resolveTheme(makeCtx({ darkTheme: 'gone.json', customThemes: [{ name: 'other.json' }] })));

		expectObsidianFallback(resolved);
	});

	test('a real bundled theme resolves to itself', async () => {
		const [bundledName] = Object.keys(bundledThemes);
		const resolved = await resolveTheme(makeCtx({ darkTheme: bundledName }));

		expect(resolved.identifier).toBe(bundledName);
		expect(resolved.usingObsidianTheme).toBe(false);
		expect(resolved.registration.colors ?? resolved.registration.tokenColors).toBeTruthy();
	});

	test('a missing bundled id falls back to the Obsidian theme and drops the old id', async () => {
		const resolved = await quietly(() => resolveTheme(makeCtx({ darkTheme: 'definitely-not-a-real-theme' })));

		expectObsidianFallback(resolved);
	});

	describe('the resolved value is usable by the renderers', () => {
		const cases: [string, () => Promise<ResolvedTheme>][] = [
			['bundled theme', () => resolveTheme(makeCtx({ darkTheme: Object.keys(bundledThemes)[0] }))],
			['Obsidian theme', () => resolveTheme(makeCtx({}))],
			['missing bundled theme', () => quietly(() => resolveTheme(makeCtx({ darkTheme: 'definitely-not-a-real-theme' })))],
			['missing custom theme', () => quietly(() => resolveTheme(makeCtx({ darkTheme: 'gone.json' })))],
		];

		test.each(cases)('shiki accepts the identifier of a loaded registration: %s', async (_name, resolve) => {
			const resolved = await resolve();
			const highlighter = await createHighlighter({ themes: [structuredClone(resolved.registration)], langs: ['ts'] });

			const result = highlighter.codeToTokens('const a = 1', { lang: 'ts', theme: resolved.identifier });
			expect(result.tokens.flat().length).toBeGreaterThan(0);
			highlighter.dispose();
		});

		test.each(cases)('expressive code accepts the theme: %s', async (_name, resolve) => {
			const ec = ecEngineFor(await resolve());

			expect((await ec.getThemeStyles()).length).toBeGreaterThan(0);
		});
	});
});
