import { describe, test, expect } from 'bun:test';
import { FenceMetaReader, type FenceSectionInfo } from 'packages/obsidian/src/FenceMeta';

// Each sectionInfo() call takes the next scripted result; the last one repeats.
function makeReader(results: (FenceSectionInfo | null)[], language = 'ts'): { reader: FenceMetaReader; waits: number[]; reads: () => number } {
	const waits: number[] = [];
	let calls = 0;
	const reader = new FenceMetaReader({
		sectionInfo: () => results[Math.min(calls++, results.length - 1)],
		language,
		wait: async ms => {
			waits.push(ms);
		},
	});
	return { reader, waits, reads: () => calls };
}

const line = (text: string): FenceSectionInfo => ({ text: `${text}\ncode\n\`\`\``, lineStart: 0 });

describe('FenceMetaReader parsing', () => {
	test.each([
		['```ts wrap', 'ts', 'wrap'],
		['```ts', 'ts', ''],
		['```ts title="a b" wrap', 'ts', 'title="a b" wrap'],
		['~~~ts a', 'ts', 'a'],
		['````ts a', 'ts', 'a'],
		['> ```ts wrap', 'ts', 'wrap'],
		['```c++ wrap', 'c++', 'wrap'],
		['```cxx wrap', 'c++', ''],
		['```js wrap', 'ts', ''],
		['```tsx wrap', 'ts', ''],
	])('%p as %p gives %p', async (fence, language, expected) => {
		const { reader } = makeReader([line(fence)], language);
		expect(await reader.onLoad()).toBe(expected);
	});

	test('reads the line at lineStart, not the first line', async () => {
		const { reader } = makeReader([{ text: 'intro\n\n```ts wrap\ncode\n```', lineStart: 2 }]);
		expect(await reader.onLoad()).toBe('wrap');
	});

	test('lineStart past the end of text counts as unavailable', async () => {
		const { reader, waits } = makeReader([{ text: 'code only', lineStart: 7 }, line('```ts wrap')]);
		expect(await reader.onLoad()).toBe('wrap');
		expect(waits).toEqual([100]);
	});
});

describe('FenceMetaReader.onLoad', () => {
	test('reads at once when section info is ready', async () => {
		const { reader, waits } = makeReader([line('```ts wrap')]);
		expect(await reader.onLoad()).toBe('wrap');
		expect(waits).toEqual([]);
	});

	test('retries until section info arrives', async () => {
		const { reader, waits } = makeReader([null, null, line('```ts wrap')]);
		expect(await reader.onLoad()).toBe('wrap');
		expect(waits).toEqual([100, 100]);
	});

	test('gives up after 5 retries and falls back to an empty meta', async () => {
		const { reader, waits, reads } = makeReader([null]);
		expect(await reader.onLoad()).toBe('');
		expect(waits).toEqual([100, 100, 100, 100, 100]);
		expect(reads()).toBe(6);
	});
});

describe('FenceMetaReader.onNoteChange', () => {
	test('waits for Obsidian to settle before the first read', async () => {
		const { reader, waits } = makeReader([line('```ts a'), line('```ts b')]);
		await reader.onLoad();
		expect(await reader.onNoteChange()).toBe('b');
		expect(waits).toEqual([100]);
	});

	test('unchanged meta gives null', async () => {
		const { reader } = makeReader([line('```ts a')]);
		await reader.onLoad();
		expect(await reader.onNoteChange()).toBeNull();
	});

	test('a changed meta becomes the cached one', async () => {
		const { reader } = makeReader([line('```ts a'), line('```ts b')]);
		await reader.onLoad();
		expect(await reader.onNoteChange()).toBe('b');
		expect(await reader.onNoteChange()).toBeNull();
	});

	test('retries once, then drops the update', async () => {
		const { reader, waits, reads } = makeReader([line('```ts a'), null]);
		await reader.onLoad();
		expect(await reader.onNoteChange()).toBeNull();
		expect(waits).toEqual([100, 100]);
		expect(reads()).toBe(3);
		expect(reader.onRefresh()).toBe('a');
	});

	test('a single retry is enough when section info comes back', async () => {
		const { reader } = makeReader([line('```ts a'), null, line('```ts b')]);
		await reader.onLoad();
		expect(await reader.onNoteChange()).toBe('b');
	});
});

describe('FenceMetaReader.onRefresh', () => {
	test('reads fresh when section info is available', async () => {
		const { reader } = makeReader([line('```ts a'), line('```ts b')]);
		await reader.onLoad();
		expect(reader.onRefresh()).toBe('b');
	});

	test('falls back to the cached meta when section info is unavailable', async () => {
		const { reader } = makeReader([line('```ts a'), null]);
		await reader.onLoad();
		expect(reader.onRefresh()).toBe('a');
	});
});
