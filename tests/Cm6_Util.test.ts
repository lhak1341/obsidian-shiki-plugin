import { describe, test, expect } from 'bun:test';
import { EditorSelection } from '@codemirror/state';
import { Cm6_Util } from 'packages/obsidian/src/codemirror/Cm6_Util';

describe('Cm6_Util.checkRangeOverlap', () => {
	test('overlapping ranges', () => {
		expect(Cm6_Util.checkRangeOverlap(0, 10, 5, 15)).toBe(true);
	});

	test('adjacent ranges share an endpoint', () => {
		expect(Cm6_Util.checkRangeOverlap(0, 5, 5, 10)).toBe(true);
	});

	test('non-overlapping ranges', () => {
		expect(Cm6_Util.checkRangeOverlap(0, 4, 5, 10)).toBe(false);
	});

	test('one range fully inside the other', () => {
		expect(Cm6_Util.checkRangeOverlap(0, 20, 5, 10)).toBe(true);
	});

	test('identical ranges', () => {
		expect(Cm6_Util.checkRangeOverlap(3, 7, 3, 7)).toBe(true);
	});
});

describe('Cm6_Util.checkSelectionAndRangeOverlap', () => {
	test('cursor inside range returns true', () => {
		const selection = EditorSelection.single(5);
		expect(Cm6_Util.checkSelectionAndRangeOverlap(selection, 3, 10)).toBe(true);
	});

	test('cursor outside range returns false', () => {
		const selection = EditorSelection.single(0);
		expect(Cm6_Util.checkSelectionAndRangeOverlap(selection, 5, 10)).toBe(false);
	});

	test('selection spanning the range returns true', () => {
		const selection = EditorSelection.single(0, 20);
		expect(Cm6_Util.checkSelectionAndRangeOverlap(selection, 5, 10)).toBe(true);
	});

	test('multiple ranges: one overlaps', () => {
		const selection = EditorSelection.create([
			EditorSelection.range(0, 2),
			EditorSelection.range(8, 12),
		]);
		expect(Cm6_Util.checkSelectionAndRangeOverlap(selection, 5, 10)).toBe(true);
	});

	test('multiple ranges: none overlap', () => {
		const selection = EditorSelection.create([
			EditorSelection.range(0, 2),
			EditorSelection.range(15, 20),
		]);
		expect(Cm6_Util.checkSelectionAndRangeOverlap(selection, 5, 10)).toBe(false);
	});
});
