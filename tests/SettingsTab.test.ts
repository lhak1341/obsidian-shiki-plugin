import { describe, expect, mock, test } from 'bun:test';
import type { Plugin } from 'obsidian';
import { excludableLanguages, ShikiSettingsTab } from 'packages/obsidian/src/settings/SettingsTab';
import { SettingsStore } from 'packages/obsidian/src/settings/SettingsStore';
import { DEFAULT_SETTINGS, type Settings } from 'packages/obsidian/src/settings/Settings';

const setup = (overrides: Partial<Settings> = {}) => {
	const save = mock(async () => {});
	const store = new SettingsStore({ ...DEFAULT_SETTINGS, ...overrides }, save);
	const scheduleReload = mock(() => {});
	const source = { getCustomThemes: () => [], supportedLanguages: ['js', 'ts', 'py'] };
	const tab = new ShikiSettingsTab({ app: {} } as unknown as Plugin, store, source, { scheduleReload });
	const update = mock(() => {});
	tab.update = update;
	return { tab, store, save, scheduleReload, update };
};

describe('excludableLanguages', () => {
	test('omits languages already excluded, keeping supported order', () => {
		expect(excludableLanguages(['js', 'ts', 'py'], ['ts'])).toEqual(['js', 'py']);
	});
});

describe('ShikiSettingsTab', () => {
	test('getControlValue reads the persisted settings', () => {
		const { tab } = setup({ darkTheme: 'nord' });
		expect(tab.getControlValue('darkTheme')).toBe('nord');
	});

	test('a reload-required edit persists and schedules a reload', async () => {
		const { tab, store, save, scheduleReload } = setup();
		await tab.setControlValue('ecDefaultWrap', !DEFAULT_SETTINGS.ecDefaultWrap);

		expect(store.persisted.ecDefaultWrap).toBe(!DEFAULT_SETTINGS.ecDefaultWrap);
		expect(save).toHaveBeenCalledTimes(1);
		expect(scheduleReload).toHaveBeenCalledTimes(1);
	});

	test('a live edit persists without scheduling a reload', async () => {
		const { tab, store, scheduleReload } = setup();
		await tab.setControlValue('inlineHighlighting', false);

		expect(store.snapshot.inlineHighlighting).toBe(false);
		expect(scheduleReload).not.toHaveBeenCalled();
	});

	test('excluding a language saves it, schedules a reload and redraws the tab', async () => {
		const { tab, store, scheduleReload, update } = setup();
		await tab.excludeLanguage('py');

		expect(store.persisted.disabledLanguages).toEqual(['py']);
		expect(scheduleReload).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledTimes(1);
	});

	test('excluding a language twice keeps one entry', async () => {
		const { tab, store, save } = setup({ disabledLanguages: ['py'] });
		await tab.excludeLanguage('py');

		expect(store.persisted.disabledLanguages).toEqual(['py']);
		expect(save).not.toHaveBeenCalled();
	});

	test('deleting a list item removes that language', async () => {
		const { tab, store } = setup({ disabledLanguages: ['js', 'py'] });
		const list = tab.getSettingDefinitions().find(item => 'type' in item && item.type === 'list');
		if (!list || !('onDelete' in list) || !list.onDelete) throw new Error('excluded-languages list missing');

		list.onDelete(0);
		await Promise.resolve();
		await Promise.resolve();

		expect(store.persisted.disabledLanguages).toEqual(['py']);
	});
});
