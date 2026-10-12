import { describe, test, expect, mock } from 'bun:test';
import { CodeBlock, type CodeBlockRenderer } from 'packages/obsidian/src/CodeBlock';
import type { MarkdownPostProcessorContext } from 'obsidian';
import type { RenderTargetRegistry } from 'packages/obsidian/src/RenderTargets';

const makeCtx = (): MarkdownPostProcessorContext =>
	({
		sourcePath: 'test.md',
		getSectionInfo: () => ({ text: '```ts option1\n```', lineStart: 0, lineEnd: 1 }),
		addChild: mock(() => {}),
	}) as unknown as MarkdownPostProcessorContext;

const makeRenderer = (renderImpl: CodeBlockRenderer['renderWithEc']): CodeBlockRenderer => ({
	renderWithEc: mock(renderImpl),
});

const makeTargets = (): RenderTargetRegistry => ({ register: mock(() => () => {}) });

describe('CodeBlock', () => {
	test('generation guard: stale render does not replace DOM', async () => {
		let resolveFirst!: () => void;
		const firstRenderDone = new Promise<void>(r => (resolveFirst = r));

		let callCount = 0;
		const renderer = makeRenderer(async (_code, _lang, _meta, el) => {
			callCount++;
			if (callCount === 1) {
				el.appendChild(document.createTextNode('render-1'));
				await firstRenderDone;
			} else {
				el.appendChild(document.createTextNode('render-2'));
			}
		});

		const containerEl = document.createElement('div');
		const block = new CodeBlock(renderer, makeTargets(), containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0)); // let onload start render #1, which hangs
		await block.forceRerender(); // render #2 completes — generation advances

		resolveFirst(); // unblock render #1
		await new Promise<void>(r => setTimeout(r, 0)); // drain microtasks

		expect(containerEl.textContent).toBe('render-2');
		expect((renderer.renderWithEc as ReturnType<typeof mock>).mock.calls.length).toBe(2);
	});

	test('_active guard: render completing after unload does not apply to DOM', async () => {
		let resolveRender!: () => void;
		const renderDone = new Promise<void>(r => (resolveRender = r));

		const renderer = makeRenderer(async (_code, _lang, _meta, el) => {
			el.appendChild(document.createTextNode('rendered'));
			await renderDone;
		});

		const containerEl = document.createElement('div');
		const block = new CodeBlock(renderer, makeTargets(), containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0)); // let onload start the render, which hangs
		block.onunload(); // sets _active = false, writes 'Unloaded...' to containerEl

		resolveRender(); // unblock — render checks _active and bails
		await new Promise<void>(r => setTimeout(r, 0));

		expect(containerEl.textContent).toBe('Unloaded shiki code block');
	});
});
