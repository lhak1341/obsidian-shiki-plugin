import { describe, test, expect, mock } from 'bun:test';
import { SettingsStore } from 'packages/obsidian/src/settings/SettingsStore';
import { DEFAULT_SETTINGS } from 'packages/obsidian/src/settings/Settings';
import type { Settings } from 'packages/obsidian/src/settings/Settings';

const makeSave = () => mock(async () => {});

const makeStore = (overrides: Partial<Settings> = {}) => {
	const initial = { ...DEFAULT_SETTINGS, ...overrides };
	const save = makeSave();
	return { store: new SettingsStore(initial, save), save };
};

describe('SettingsStore', () => {
	test('constructor: persisted and snapshot start equal to initial', () => {
		const { store } = makeStore({ darkTheme: 'nord' });
		expect(store.persisted.darkTheme).toBe('nord');
		expect(store.snapshot.darkTheme).toBe('nord');
	});

	test('constructor: snapshot is a deep clone of initial (not the same reference)', () => {
		const initial = { ...DEFAULT_SETTINGS, disabledLanguages: ['python'] };
		const store = new SettingsStore(initial, makeSave());
		// mutating the snapshot should not affect persisted (they must be separate objects)
		expect(store.persisted.disabledLanguages).toEqual(['python']);
		expect(store.snapshot.disabledLanguages).toEqual(['python']);
	});

	test('set: updates persisted, does NOT update snapshot', async () => {
		const { store } = makeStore();
		await store.set('darkTheme', 'github-dark');
		expect(store.persisted.darkTheme).toBe('github-dark');
		expect(store.snapshot.darkTheme).toBe(DEFAULT_SETTINGS.darkTheme);
	});

	test('set: calls save', async () => {
		const { store, save } = makeStore();
		await store.set('darkTheme', 'github-dark');
		expect(save.mock.calls.length).toBe(1);
	});

	test('setLive: updates both persisted and snapshot', async () => {
		const { store } = makeStore();
		await store.setLive('inlineHighlighting', false);
		expect(store.persisted.inlineHighlighting).toBe(false);
		expect(store.snapshot.inlineHighlighting).toBe(false);
	});

	test('setLive: calls save', async () => {
		const { store, save } = makeStore();
		await store.setLive('inlineHighlighting', false);
		expect(save.mock.calls.length).toBe(1);
	});

	test('flush: copies persisted into snapshot', async () => {
		const { store } = makeStore();
		await store.set('darkTheme', 'github-dark');
		expect(store.snapshot.darkTheme).toBe(DEFAULT_SETTINGS.darkTheme); // not yet flushed
		store.flush();
		expect(store.snapshot.darkTheme).toBe('github-dark');
	});

	test('flush: snapshot is a fresh clone (not aliased to persisted)', async () => {
		const { store } = makeStore({ disabledLanguages: ['python'] });
		await store.set('disabledLanguages', ['python', 'ruby']);
		store.flush();
		// persisted and snapshot must be independent — flush clones, not aliases
		expect(store.snapshot.disabledLanguages).toEqual(['python', 'ruby']);
		expect(store.persisted.disabledLanguages).toEqual(['python', 'ruby']);
	});

	test('multiple set calls accumulate in persisted; single flush exposes all to snapshot', async () => {
		const { store } = makeStore();
		await store.set('darkTheme', 'nord');
		await store.set('lightTheme', 'github-light');
		store.flush();
		expect(store.snapshot.darkTheme).toBe('nord');
		expect(store.snapshot.lightTheme).toBe('github-light');
	});
});
