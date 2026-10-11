import { describe, test, expect, mock, spyOn } from 'bun:test';
import { RenderTargets, type RenderTarget } from 'packages/obsidian/src/RenderTargets';

const setup = (): { calls: string[]; targets: RenderTargets; host: { reloadHighlighter: ReturnType<typeof mock> } } => {
	const calls: string[] = [];
	const host = { reloadHighlighter: mock(async () => void calls.push('highlighter')) };
	return { calls, host, targets: new RenderTargets(host) };
};

const target = (calls: string[], name: string, extra: Partial<RenderTarget> = {}): RenderTarget => ({
	refresh: async () => void calls.push(name),
	...extra,
});

describe('RenderTargets', () => {
	test('reload order: highlighter, then note-bound blocks, then CM6 views', async () => {
		const { calls, targets } = setup();
		targets.register(target(calls, 'cm6'));
		targets.register(target(calls, 'block-a', { sourcePath: 'a.md' }));
		targets.register(target(calls, 'block-b', { sourcePath: 'b.md' }));

		await targets.reload();

		expect(calls).toEqual(['highlighter', 'block-a', 'block-b', 'cm6']);
	});

	test('reload requested mid-reload coalesces into one trailing reload', async () => {
		const { calls, host, targets } = setup();
		let release!: () => void;
		const gate = new Promise<void>(r => (release = r));
		host.reloadHighlighter.mockImplementationOnce(async () => {
			calls.push('highlighter');
			await gate;
		});
		targets.register(target(calls, 'block', { sourcePath: 'a.md' }));

		const first = targets.reload();
		const second = targets.reload();
		const third = targets.reload();
		release();
		await Promise.all([first, second, third]);

		expect(calls).toEqual(['highlighter', 'block', 'highlighter', 'block']);
	});

	test('reload after completion starts a fresh run', async () => {
		const { calls, targets } = setup();
		await targets.reload();
		await targets.reload();
		expect(calls).toEqual(['highlighter', 'highlighter']);
	});

	test('a throwing target does not stop the rest', async () => {
		const { calls, targets } = setup();
		const warn = spyOn(console, 'warn').mockImplementation(() => {});
		targets.register({
			sourcePath: 'a.md',
			refresh: async () => {
				throw new Error('boom');
			},
		});
		targets.register(target(calls, 'block-b', { sourcePath: 'b.md' }));
		targets.register(target(calls, 'cm6'));

		await targets.reload();

		expect(calls).toEqual(['highlighter', 'block-b', 'cm6']);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	test('a failed reload does not wedge later reloads', async () => {
		const { calls, host, targets } = setup();
		host.reloadHighlighter.mockImplementationOnce(async () => {
			throw new Error('load failed');
		});

		await expect(targets.reload()).rejects.toThrow('load failed');
		await targets.reload();

		expect(calls).toEqual(['highlighter']);
	});

	test('disposer removes the target; calling it twice is harmless', async () => {
		const { calls, targets } = setup();
		const dispose = targets.register(target(calls, 'block', { sourcePath: 'a.md' }));
		const disposeCm6 = targets.register(target(calls, 'cm6'));
		dispose();
		dispose();
		disposeCm6();

		await targets.reload();

		expect(calls).toEqual(['highlighter']);
	});

	test('disposing one target keeps its siblings on the same path', async () => {
		const { calls, targets } = setup();
		const disposeA = targets.register(target(calls, 'one', { sourcePath: 'a.md' }));
		targets.register(target(calls, 'two', { sourcePath: 'a.md' }));
		disposeA();

		await targets.reload();

		expect(calls).toEqual(['highlighter', 'two']);
	});

	test('rerenderFor calls onNoteChange only on matching targets that declare it', () => {
		const { calls, targets } = setup();
		targets.register(target(calls, 'a-block', { sourcePath: 'a.md', onNoteChange: async () => void calls.push('a-note') }));
		targets.register(target(calls, 'a-inline', { sourcePath: 'a.md' }));
		targets.register(target(calls, 'b-block', { sourcePath: 'b.md', onNoteChange: async () => void calls.push('b-note') }));
		targets.register(target(calls, 'cm6'));

		targets.rerenderFor('a.md');

		expect(calls).toEqual(['a-note']);
	});

	test('rerenderFor swallows a throwing onNoteChange', async () => {
		const { targets } = setup();
		const warn = spyOn(console, 'warn').mockImplementation(() => {});
		targets.register({
			sourcePath: 'a.md',
			refresh: async () => {},
			onNoteChange: async () => {
				throw new Error('boom');
			},
		});

		targets.rerenderFor('a.md');
		await new Promise<void>(r => setTimeout(r, 0));

		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});
