import type * as hast_types from 'hast';
import { type ThemeRegistration } from 'shiki';

export function encodeCssVarTheme(theme: ThemeRegistration): {
	theme: ThemeRegistration;
	decodeString: (css: string) => string;
	decodeHast: (ast: hast_types.Parents) => void;
} {
	const cssVarToPlaceholder = new Map<string, string>();
	let counter = 0;

	const encode = (value: string): string => {
		if (!value.trim().startsWith('var(')) return value;
		const existing = cssVarToPlaceholder.get(value);
		if (existing) return existing;
		const placeholder = `#${counter.toString(16).padStart(6, '0').toUpperCase()}`;
		counter += 1;
		cssVarToPlaceholder.set(value, placeholder);
		return placeholder;
	};

	const encodedTheme: ThemeRegistration = {
		...theme,
		colors: Object.fromEntries(Object.entries(theme.colors ?? {}).map(([key, value]) => [key, encode(value)])),
		tokenColors: (theme.tokenColors ?? []).map(token => {
			if (!token.settings) return token;
			return {
				...token,
				settings: {
					...token.settings,
					foreground: token.settings.foreground ? encode(token.settings.foreground) : token.settings.foreground,
					background: token.settings.background ? encode(token.settings.background) : token.settings.background,
				},
			};
		}),
	};

	const decodeString = (css: string): string => {
		let output = css;
		for (const [cssVar, placeholder] of cssVarToPlaceholder) {
			output = output.replaceAll(placeholder, cssVar);
		}
		return output;
	};

	const fixNode = (node: hast_types.Element): void => {
		if (node.properties?.style) {
			let style = node.properties.style as string;
			for (const [cssVar, placeholder] of cssVarToPlaceholder) {
				style = style.replaceAll(placeholder, cssVar);
			}
			node.properties.style = style;
		}
		for (const child of node.children) {
			if (child.type === 'element') {
				fixNode(child);
			}
		}
	};

	const decodeHast = (ast: hast_types.Parents): void => {
		for (const child of ast.children) {
			if (child.type === 'element') {
				fixNode(child);
			}
		}
	};

	return { theme: encodedTheme, decodeString, decodeHast };
}
