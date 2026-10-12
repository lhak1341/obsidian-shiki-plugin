import { describe, test, expect } from 'bun:test';
import { bundledThemes, type ThemeRegistration } from 'shiki';
import type * as hast_types from 'hast';
import { createEcEngine, type EcEngine } from 'packages/ec-core/src/EcEngine';
import { EC_DEFAULT_SETTINGS, type EcSettingsProps } from 'packages/ec-core/src/Config';
import { OBSIDIAN_THEME } from 'packages/ec-core/src/ObsidianTheme';

// encodeCssVarTheme's placeholders are #000000, #000001, …
const PLACEHOLDER = /#0000[0-9a-f]{2,4}\b/gi;

const engine = (registration: ThemeRegistration, usingObsidianTheme: boolean, settings: Partial<EcSettingsProps> = {}): EcEngine =>
	createEcEngine({
		// shiki normalises a registration it is given in place, so every test works on its own copy
		theme: { registration: structuredClone(registration), usingObsidianTheme },
		customLanguages: [],
		settings: { ...EC_DEFAULT_SETTINGS, ...settings },
	});

const obsidian = (settings: Partial<EcSettingsProps> = {}): EcEngine => engine(OBSIDIAN_THEME, true, settings);

const bundled = async (): Promise<ThemeRegistration> => {
	const name = Object.keys(bundledThemes)[0] as keyof typeof bundledThemes;
	return (await bundledThemes[name]()).default as ThemeRegistration;
};

const declaration = (css: string, name: string): string | undefined => new RegExp(`${name}:([^;}]*)`).exec(css)?.[1];
const codeBackground = (css: string): string | undefined => declaration(css, '--ec-codeBg');

const findPre = (node: hast_types.Element): hast_types.Element | undefined => {
	if (node.tagName === 'pre') return node;
	for (const child of node.children) {
		if (child.type !== 'element') continue;
		const found = findPre(child);
		if (found) return found;
	}
	return undefined;
};

describe('createEcEngine with the Obsidian theme', () => {
	test('rendered token colours are the CSS variables, not placeholders', async () => {
		const ast = JSON.stringify(await obsidian().render({ code: 'const x = 1', language: 'ts', meta: '' }));
		expect(ast.match(PLACEHOLDER)).toBeNull();
		expect(ast).toContain('var(--shiki-');
	});

	test('base and theme styles carry no placeholders', async () => {
		const ec = obsidian();
		expect((await ec.getBaseStyles()).match(PLACEHOLDER)).toBeNull();
		expect((await ec.getThemeStyles()).match(PLACEHOLDER)).toBeNull();
	});

	test('preferThemeColors does not replace the CSS-variable colours', async () => {
		const css = await obsidian({ preferThemeColors: true }).getThemeStyles();
		expect(codeBackground(css)).toBe('var(--shiki-code-background)');
		// the Obsidian theme has no line-number colours, so theme colours would fall back to EC's defaults
		expect(declaration(css, '--ec-gtrFg')).toBe('var(--shiki-gutter-text-color)');
		expect(declaration(css, '--ec-gtrHlFg')).toBe('var(--shiki-gutter-text-color-highlight)');
	});

	test('meta and defaults reach the rendered block', async () => {
		const wrapped = findPre(await obsidian({ ecDefaultWrap: true }).render({ code: 'x', language: 'ts', meta: '' }));
		const plain = findPre(await obsidian().render({ code: 'x', language: 'ts', meta: '' }));
		const byMeta = findPre(await obsidian().render({ code: 'x', language: 'ts', meta: 'wrap' }));
		expect(wrapped?.properties.className).toContain('wrap');
		expect(plain?.properties.className ?? []).not.toContain('wrap');
		expect(byMeta?.properties.className).toContain('wrap');
	});
});

describe('createEcEngine with another theme', () => {
	test('preferThemeColors uses the theme background', async () => {
		const registration = await bundled();
		const css = await engine(registration, false, { preferThemeColors: true }).getThemeStyles();
		expect(codeBackground(css)?.toLowerCase()).toBe(registration.colors?.['editor.background']?.toLowerCase());
	});

	test('without preferThemeColors the background is the CSS variable', async () => {
		const css = await engine(await bundled(), false, { preferThemeColors: false }).getThemeStyles();
		expect(codeBackground(css)).toBe('var(--shiki-code-background)');
	});
});
