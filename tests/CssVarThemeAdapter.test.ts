import { describe, test, expect } from 'bun:test';
import { encodeCssVarTheme } from 'packages/ec-core/src/CssVarThemeAdapter';
import type * as hast_types from 'hast';
import { type ThemeRegistration } from 'shiki';

// Helpers

function makeTheme(colors: Record<string, string>, tokenColors: ThemeRegistration['tokenColors'] = []): ThemeRegistration {
	return { colors, tokenColors } as ThemeRegistration;
}

// Tests

describe('encodeCssVarTheme', () => {
	test('non-var() values pass through unencoded', () => {
		const { theme } = encodeCssVarTheme(makeTheme({ 'editor.background': '#111111' }));
		expect(theme.colors?.['editor.background']).toBe('#111111');
	});

	test('var() values are placeholder-encoded, same value reuses same placeholder', () => {
		const { theme } = encodeCssVarTheme(
			makeTheme({
				'editor.background': 'var(--bg)',
				'editor.foreground': 'var(--fg)',
				'panel.background': 'var(--bg)',
			}),
		);

		const bg = theme.colors?.['editor.background'];
		const fg = theme.colors?.['editor.foreground'];
		const panelBg = theme.colors?.['panel.background'];

		expect(bg).toMatch(/^#[0-9A-F]{6}$/);
		expect(fg).toMatch(/^#[0-9A-F]{6}$/);
		expect(bg).toBe(panelBg); // same source value → same placeholder
		expect(bg).not.toBe(fg);
	});

	test('decodeString reverses placeholders back to original var() strings', () => {
		const { theme, decodeString } = encodeCssVarTheme(makeTheme({ 'editor.background': 'var(--bg)' }));
		const placeholder = theme.colors!['editor.background'];

		expect(decodeString(`color: ${placeholder};`)).toBe('color: var(--bg);');
	});

	test('decodeHast fixes style attributes at every depth', () => {
		const { theme, decodeHast } = encodeCssVarTheme(makeTheme({ 'editor.background': 'var(--bg)' }));
		const placeholder = theme.colors!['editor.background'];

		const ast = {
			type: 'root',
			children: [
				{
					type: 'element',
					tagName: 'div',
					properties: { style: `background: ${placeholder};` },
					children: [
						{
							type: 'element',
							tagName: 'span',
							properties: { style: `color: ${placeholder};` },
							children: [],
						},
					],
				},
			],
		} as unknown as hast_types.Parents;

		decodeHast(ast);

		const outer = ast.children[0] as hast_types.Element;
		const inner = outer.children[0] as hast_types.Element;
		expect(outer.properties.style).toBe('background: var(--bg);');
		expect(inner.properties.style).toBe('color: var(--bg);');
	});

	test('tokenColors entry with no settings passes through unchanged', () => {
		const tokenColors = [{ scope: 'comment' }] as ThemeRegistration['tokenColors'];
		const { theme } = encodeCssVarTheme(makeTheme({}, tokenColors));
		expect(theme.tokenColors?.[0]).toEqual({ scope: 'comment' } as never);
	});

	test('tokenColors entry with only foreground leaves background untouched', () => {
		const tokenColors = [{ settings: { foreground: 'var(--fg)' } }] as ThemeRegistration['tokenColors'];
		const { theme } = encodeCssVarTheme(makeTheme({}, tokenColors));

		expect(theme.tokenColors?.[0].settings?.foreground).toMatch(/^#[0-9A-F]{6}$/);
		expect(theme.tokenColors?.[0].settings?.background).toBeUndefined();
	});
});
