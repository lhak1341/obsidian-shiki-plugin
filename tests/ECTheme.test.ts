import { describe, test, expect } from 'bun:test';
import { getECTheme } from 'packages/ec-core/src/ECTheme';

// Helpers

type ColorFn = (arg: { theme: { colors: Record<string, string> } }) => unknown;

function callWithColors(field: unknown, colors: Record<string, string>): unknown {
	return (field as ColorFn)({ theme: { colors } });
}

// Tests

describe('getECTheme', () => {
	test('useThemeColors=false → color fields are plain CSS var strings', () => {
		const result = getECTheme(false)!;
		expect(result.codeBackground).toBe('var(--shiki-code-background)');
		expect(result.codeForeground).toBe('var(--shiki-code-normal)');
		expect(result.gutterBorderColor).toBe('var(--shiki-gutter-border-color)');
		expect(result.gutterForeground).toBe('var(--shiki-gutter-text-color)');
		expect(result.gutterHighlightForeground).toBe('var(--shiki-gutter-text-color-highlight)');
	});

	test('useThemeColors=true → color fields are functions reading theme.colors, with fallback', () => {
		const result = getECTheme(true)!;

		expect(callWithColors(result.codeBackground, { 'editor.background': '#111' })).toBe('#111');
		expect(callWithColors(result.codeBackground, {})).toBe('var(--shiki-code-background)');

		expect(callWithColors(result.codeForeground, { 'editor.foreground': '#eee' })).toBe('#eee');
		expect(callWithColors(result.codeForeground, {})).toBe('var(--shiki-code-normal)');

		expect(callWithColors(result.gutterBorderColor, { 'editorLineNumber.foreground': '#aaa' })).toBe('#aaa');
		expect(callWithColors(result.gutterBorderColor, {})).toBe('var(--shiki-gutter-border-color)');

		expect(callWithColors(result.gutterForeground, { 'editorLineNumber.foreground': '#bbb' })).toBe('#bbb');
		expect(callWithColors(result.gutterForeground, {})).toBe('var(--shiki-gutter-text-color)');
	});

	test('gutterHighlightForeground prefers activeForeground over foreground, falls back to CSS var', () => {
		const result = getECTheme(true)!;

		expect(
			callWithColors(result.gutterHighlightForeground, {
				'editorLineNumber.activeForeground': '#active',
				'editorLineNumber.foreground': '#normal',
			}),
		).toBe('#active');

		expect(callWithColors(result.gutterHighlightForeground, { 'editorLineNumber.foreground': '#normal' })).toBe('#normal');

		expect(callWithColors(result.gutterHighlightForeground, {})).toBe('var(--shiki-gutter-text-color-highlight)');
	});

	test('static fields stay constant regardless of useThemeColors', () => {
		expect(getECTheme(true)!.borderColor).toBe('var(--shiki-code-block-border-color)');
		expect(getECTheme(false)!.borderColor).toBe('var(--shiki-code-block-border-color)');
	});
});
