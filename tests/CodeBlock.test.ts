import { describe, test, expect, mock } from 'bun:test';
import { CodeBlock, type CodeBlockHost } from 'packages/obsidian/src/CodeBlock';
import type { MarkdownPostProcessorContext } from 'obsidian';

const makeCtx = (): MarkdownPostProcessorContext =>
	({
		sourcePath: 'test.md',
		getSectionInfo: () => ({ text: '```ts option1\n```', lineStart: 0, lineEnd: 1 }),
		addChild: mock(() => {}),
	}) as unknown as MarkdownPostProcessorContext;

const makeHost = (renderImpl: CodeBlockHost['renderWithEc']): CodeBlockHost => ({
	renderWithEc: mock(renderImpl),
	addActiveCodeBlock: mock(() => {}),
	removeActiveCodeBlock: mock(() => {}),
});

describe('CodeBlock', () => {
	test('generation guard: stale render does not replace DOM', async () => {
		let resolveFirst!: () => void;
		const firstRenderDone = new Promise<void>(r => (resolveFirst = r));

		let callCount = 0;
		const host = makeHost(async (_code, _lang, _meta, el) => {
			callCount++;
			if (callCount === 1) {
				el.appendChild(document.createTextNode('render-1'));
				await firstRenderDone;
			} else {
				el.appendChild(document.createTextNode('render-2'));
			}
		});

		const containerEl = document.createElement('div');
		const block = new CodeBlock(host, containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload(); // starts render #1, hangs
		await block.forceRerender(); // render #2 completes — generation advances

		resolveFirst(); // unblock render #1
		await new Promise<void>(r => setTimeout(r, 0)); // drain microtasks

		expect(containerEl.textContent).toBe('render-2');
		expect((host.renderWithEc as ReturnType<typeof mock>).mock.calls.length).toBe(2);
	});

	test('_active guard: render completing after unload does not apply to DOM', async () => {
		let resolveRender!: () => void;
		const renderDone = new Promise<void>(r => (resolveRender = r));

		const host = makeHost(async (_code, _lang, _meta, el) => {
			el.appendChild(document.createTextNode('rendered'));
			await renderDone;
		});

		const containerEl = document.createElement('div');
		const block = new CodeBlock(host, containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload(); // starts render, hangs
		block.onunload(); // sets _active = false, writes 'Unloaded...' to containerEl

		resolveRender(); // unblock — render checks _active and bails
		await new Promise<void>(r => setTimeout(r, 0));

		expect(containerEl.textContent).toBe('Unloaded shiki code block');
	});

	test('rerenderOnNoteChange: skips rerender when meta string is unchanged', async () => {
		const host = makeHost(async (_code, _lang, _meta, el) => {
			el.appendChild(document.createTextNode('rendered'));
		});

		const containerEl = document.createElement('div');
		const block = new CodeBlock(host, containerEl, 'const x = 1', 'ts', makeCtx());

		block.onload();
		await new Promise<void>(r => setTimeout(r, 0)); // let onload render finish

		const callsBefore = (host.renderWithEc as ReturnType<typeof mock>).mock.calls.length;
		await block.rerenderOnNoteChange(); // same meta string — should skip
		const callsAfter = (host.renderWithEc as ReturnType<typeof mock>).mock.calls.length;

		expect(callsAfter).toBe(callsBefore);
	});
});
