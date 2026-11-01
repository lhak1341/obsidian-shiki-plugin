import { describe, test, expect, mock } from 'bun:test';
import { SettingsStore } from 'packages/obsidian/src/settings/SettingsStore';
import { DEFAULT_SETTINGS, FrameType } from 'packages/obsidian/src/settings/Settings';
import type { Settings } from 'packages/obsidian/src/settings/Settings';

const makeSave = () => mock(async () => {});

// a value different from the default for every setting
const changed: { [K in keyof Settings]: Settings[K] } = {
	disabledLanguages: ['python'],
	customThemeFolder: 'themes',
	customLanguageFolder: 'languages',
	theme: 'nord',
	darkTheme: 'nord',
	lightTheme: 'github-light',
	preferThemeColors: !DEFAULT_SETTINGS.preferThemeColors,
	inlineHighlighting: !DEFAULT_SETTINGS.inlineHighlighting,
	ecDefaultShowLineNumbers: !DEFAULT_SETTINGS.ecDefaultShowLineNumbers,
	ecDefaultWrap: !DEFAULT_SETTINGS.ecDefaultWrap,
	ecDefaultFrame: FrameType.Terminal,
};

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

	test('update: a live setting reaches the snapshot at once', async () => {
		const { store } = makeStore();
		expect(await store.update('inlineHighlighting', false)).toBe(false);
		expect(store.persisted.inlineHighlighting).toBe(false);
		expect(store.snapshot.inlineHighlighting).toBe(false);
	});

	test('update: every other setting waits for flush', async () => {
		const keys = (Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]).filter(key => key !== 'inlineHighlighting');
		expect(keys.length).toBe(Object.keys(DEFAULT_SETTINGS).length - 1);
		for (const key of keys) {
			const { store } = makeStore();
			const before = structuredClone(store.snapshot[key]);
			const value = changed[key];
			expect(await store.update(key, value as never), key).toBe(true);
			expect(store.persisted[key], key).toEqual(value);
			expect(store.snapshot[key], key).toEqual(before);
		}
	});

	test('update: calls save', async () => {
		const { store, save } = makeStore();
		await store.update('darkTheme', 'github-dark');
		await store.update('inlineHighlighting', false);
		expect(save.mock.calls.length).toBe(2);
	});

	test('reset: writes the default to persisted and snapshot, and saves', async () => {
		const { store, save } = makeStore({ darkTheme: 'missing.json' });
		await store.reset('darkTheme');
		expect(store.persisted.darkTheme).toBe(DEFAULT_SETTINGS.darkTheme);
		expect(store.snapshot.darkTheme).toBe(DEFAULT_SETTINGS.darkTheme);
		expect(save.mock.calls.length).toBe(1);
	});

	test('reset: leaves other pending edits out of the snapshot', async () => {
		const { store } = makeStore({ darkTheme: 'missing.json' });
		await store.update('lightTheme', 'github-light');
		await store.reset('darkTheme');
		expect(store.snapshot.lightTheme).toBe(DEFAULT_SETTINGS.lightTheme);
	});

	test('flush: copies persisted into snapshot', async () => {
		const { store } = makeStore();
		await store.update('darkTheme', 'github-dark');
		expect(store.snapshot.darkTheme).toBe(DEFAULT_SETTINGS.darkTheme); // not yet flushed
		store.flush();
		expect(store.snapshot.darkTheme).toBe('github-dark');
	});

	test('flush: snapshot is a fresh clone (not aliased to persisted)', async () => {
		const { store } = makeStore({ disabledLanguages: ['python'] });
		await store.update('disabledLanguages', ['python', 'ruby']);
		store.flush();
		// persisted and snapshot must be independent — flush clones, not aliases
		expect(store.snapshot.disabledLanguages).toEqual(['python', 'ruby']);
		expect(store.persisted.disabledLanguages).toEqual(['python', 'ruby']);
	});

	test('multiple set calls accumulate in persisted; single flush exposes all to snapshot', async () => {
		const { store } = makeStore();
		await store.update('darkTheme', 'nord');
		await store.update('lightTheme', 'github-light');
		store.flush();
		expect(store.snapshot.darkTheme).toBe('nord');
		expect(store.snapshot.lightTheme).toBe('github-light');
	});
});
