import { describe, test, expect } from 'bun:test';
import { safeLanguageNames } from 'packages/obsidian/src/Highlighter';

describe('safeLanguageNames', () => {
	test('drops languages that break Obsidian code block registration', () => {
		expect(safeLanguageNames(['ts', 'c++', 'c#', 'f#', 'mermaid', 'python'], [])).toEqual(['ts', 'python']);
	});

	test('drops user-disabled languages', () => {
		expect(safeLanguageNames(['ts', 'python', 'ruby'], ['python'])).toEqual(['ts', 'ruby']);
	});

	test('keeps order and does not mutate its inputs', () => {
		const supported = ['b', 'a', 'mermaid'];
		const disabled = ['x'];
		expect(safeLanguageNames(supported, disabled)).toEqual(['b', 'a']);
		expect(supported).toEqual(['b', 'a', 'mermaid']);
		expect(disabled).toEqual(['x']);
	});
});
