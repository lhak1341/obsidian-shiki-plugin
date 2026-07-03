import { describe, test, expect, mock } from 'bun:test';
import { InlineCodeBlock, type InlineCodeBlockHost } from 'packages/obsidian/src/InlineCodeBlock';
import type { MarkdownPostProcessorContext } from 'obsidian';
import type { ThemedToken, TokensResult } from 'shiki';

const makeCtx = (): MarkdownPostProcessorContext =>
	({ sourcePath: 'test.md', addChild: mock(() => {}) }) as unknown as MarkdownPostProcessorContext;

const makeToken = (content: string, color = '#ffffff'): ThemedToken =>
	({ content, color, offset: 0 }) as ThemedToken;

const makeHost = (overrides: Partial<InlineCodeBlockHost> = {}): InlineCodeBlockHost => ({
	getHighlightTokens: mock(async () => undefined),
	renderTokens: mock(() => {}),
	addActiveCodeBlock: mock(() => {}),
	removeActiveCodeBlock: mock(() => {}),
	...overrides,
});

describe('InlineCodeBlock', () => {
	test('falls back to raw source text when no tokens returned', async () => {
		const host = makeHost({ getHighlightTokens: mock(async () => undefined) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(host, containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));

		expect(containerEl.innerText).toBe('const x = 1');
		expect((host.renderTokens as ReturnType<typeof mock>).mock.calls.length).toBe(0);
	});

	test('falls back to raw source text when tokens array is empty', async () => {
		const emptyResult = { tokens: [[]] } as unknown as TokensResult;
		const host = makeHost({ getHighlightTokens: mock(async () => emptyResult) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(host, containerEl, 'hello', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));

		expect(containerEl.innerText).toBe('hello');
	});

	test('calls renderTokens with flattened tokens when highlighting succeeds', async () => {
		const line1 = [makeToken('const'), makeToken(' x')];
		const line2 = [makeToken(' = 1')];
		const result = { tokens: [line1, line2] } as unknown as TokensResult;
		const host = makeHost({ getHighlightTokens: mock(async () => result) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(host, containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));

		const calls = (host.renderTokens as ReturnType<typeof mock>).mock.calls;
		expect(calls.length).toBe(1);
		expect(calls[0]![0]).toEqual([...line1, ...line2]);
		expect(calls[0]![1]).toBe(containerEl);
	});

	test('forceRerender triggers a fresh render', async () => {
		const host = makeHost({ getHighlightTokens: mock(async () => undefined) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(host, containerEl, 'x', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));
		await block.forceRerender();

		expect((host.getHighlightTokens as ReturnType<typeof mock>).mock.calls.length).toBe(2);
	});

	test('rerenderOnNoteChange is a noop', async () => {
		const host = makeHost();
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(host, containerEl, 'x', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));
		const callsBefore = (host.getHighlightTokens as ReturnType<typeof mock>).mock.calls.length;

		await block.rerenderOnNoteChange();

		expect((host.getHighlightTokens as ReturnType<typeof mock>).mock.calls.length).toBe(callsBefore);
	});

	test('onunload clears container and deregisters', () => {
		const host = makeHost();
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(host, containerEl, 'x', 'ts', makeCtx());

		block.onload();
		block.onunload();

		expect(containerEl.textContent).toBe('Unloaded shiki inline code block');
		expect((host.removeActiveCodeBlock as ReturnType<typeof mock>).mock.calls.length).toBe(1);
	});
});
