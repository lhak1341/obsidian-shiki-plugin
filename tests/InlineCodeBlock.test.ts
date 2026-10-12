import { describe, test, expect, mock } from 'bun:test';
import { InlineCodeBlock, type InlineCodeRenderer } from 'packages/obsidian/src/InlineCodeBlock';
import type { RenderTargetRegistry } from 'packages/obsidian/src/RenderTargets';
import type { MarkdownPostProcessorContext } from 'obsidian';
import type { ThemedToken, TokensResult } from 'shiki';

const makeCtx = (): MarkdownPostProcessorContext => ({ sourcePath: 'test.md', addChild: mock(() => {}) }) as unknown as MarkdownPostProcessorContext;

const makeToken = (content: string, color = '#ffffff'): ThemedToken => ({ content, color, offset: 0 }) as ThemedToken;

const makeRenderer = (overrides: Partial<InlineCodeRenderer> = {}): InlineCodeRenderer => ({
	getHighlightTokens: mock(async () => undefined),
	renderTokens: mock(() => {}),
	...overrides,
});

const makeTargets = (register: RenderTargetRegistry['register'] = mock(() => () => {})): RenderTargetRegistry => ({ register });

describe('InlineCodeBlock', () => {
	test('falls back to raw source text when no tokens returned', async () => {
		const renderer = makeRenderer({ getHighlightTokens: mock(async () => undefined) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(renderer, makeTargets(), containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));

		expect(containerEl.innerText).toBe('const x = 1');
		expect((renderer.renderTokens as ReturnType<typeof mock>).mock.calls.length).toBe(0);
	});

	test('falls back to raw source text when tokens array is empty', async () => {
		const emptyResult = { tokens: [[]] } as unknown as TokensResult;
		const renderer = makeRenderer({ getHighlightTokens: mock(async () => emptyResult) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(renderer, makeTargets(), containerEl, 'hello', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));

		expect(containerEl.innerText).toBe('hello');
	});

	test('calls renderTokens with flattened tokens when highlighting succeeds', async () => {
		const line1 = [makeToken('const'), makeToken(' x')];
		const line2 = [makeToken(' = 1')];
		const result = { tokens: [line1, line2] } as unknown as TokensResult;
		const renderer = makeRenderer({ getHighlightTokens: mock(async () => result) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(renderer, makeTargets(), containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));

		const calls = (renderer.renderTokens as ReturnType<typeof mock>).mock.calls;
		expect(calls.length).toBe(1);
		expect(calls[0]![0]).toEqual([...line1, ...line2]);
		expect(calls[0]![1]).toBe(containerEl);
	});

	test('forceRerender triggers a fresh render', async () => {
		const renderer = makeRenderer({ getHighlightTokens: mock(async () => undefined) });
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(renderer, makeTargets(), containerEl, 'x', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0));
		await block.forceRerender();

		expect((renderer.getHighlightTokens as ReturnType<typeof mock>).mock.calls.length).toBe(2);
	});

	test('generation guard: stale render does not replace DOM', async () => {
		let resolveFirst!: () => void;
		const firstRenderDone = new Promise<void>(r => (resolveFirst = r));

		let callCount = 0;
		const line = [makeToken('x')];
		const renderer = makeRenderer({
			getHighlightTokens: mock(async () => {
				callCount++;
				if (callCount === 1) await firstRenderDone;
				return { tokens: [line] } as unknown as TokensResult;
			}),
		});

		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(renderer, makeTargets(), containerEl, 'x', 'ts', makeCtx());

		block.onload(); // starts render #1, hangs
		await block.forceRerender(); // render #2 completes first — generation advances

		resolveFirst(); // unblock render #1
		await new Promise<void>(r => setTimeout(r, 0)); // drain microtasks

		// render #1 should have been dropped; renderTokens called only for render #2
		expect((renderer.renderTokens as ReturnType<typeof mock>).mock.calls.length).toBe(1);
	});

	test('_active guard: render completing after unload does not apply to DOM', async () => {
		let resolveRender!: () => void;
		const renderDone = new Promise<void>(r => (resolveRender = r));

		const renderer = makeRenderer({
			getHighlightTokens: mock(async () => {
				await renderDone;
				return undefined;
			}),
		});

		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(renderer, makeTargets(), containerEl, 'x', 'ts', makeCtx());

		block.onload(); // starts render, hangs on getHighlightTokens
		block.onunload(); // sets _active = false, writes placeholder

		resolveRender(); // unblock — render checks _active and bails
		await new Promise<void>(r => setTimeout(r, 0));

		expect(containerEl.textContent).toBe('Unloaded shiki inline code block');
	});

	test('onunload clears container and deregisters', () => {
		const dispose = mock(() => {});
		const renderer = makeRenderer();
		const containerEl = document.createElement('code');
		const block = new InlineCodeBlock(renderer, makeTargets(mock(() => dispose)), containerEl, 'x', 'ts', makeCtx());

		block.onload();
		block.onunload();

		expect(containerEl.textContent).toBe('Unloaded shiki inline code block');
		expect(dispose.mock.calls.length).toBe(1);
	});
});
