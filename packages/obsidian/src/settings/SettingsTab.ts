import { type Plugin, PluginSettingTab, Platform, Notice, normalizePath, type SettingDefinitionItem } from 'obsidian';
import type { CustomTheme } from 'packages/obsidian/src/CustomAssets';
import { StringSelectModal } from 'packages/obsidian/src/settings/StringSelectModal';
import { bundledThemesInfo } from 'shiki';
import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';
import { FrameType, type Settings } from 'packages/obsidian/src/settings/Settings';

export interface SettingsTabStore {
	readonly persisted: Readonly<Settings>;
	/** Resolves to whether the edit needs a highlighter reload to take effect. */
	update<K extends keyof Settings>(key: K, value: Settings[K]): Promise<boolean>;
}

export interface ThemeLanguageSource {
	getCustomThemes(): CustomTheme[];
	readonly supportedLanguages: string[];
}

export interface ReloadScheduler {
	/** Requests a highlighter reload; a burst of requests collapses into one. */
	scheduleReload(): void;
}

/** Languages the "Exclude language" picker offers: every supported one not already excluded. */
export function excludableLanguages(supported: readonly string[], excluded: readonly string[]): string[] {
	const taken = new Set(excluded);
	return supported.filter(language => !taken.has(language));
}

/**
 * Declarative settings tab (Obsidian 1.13 settings API). Controls read and write through the
 * settings store; an edit that needs a reload schedules one, so there is no reload button.
 * Call `update()` after a highlighter reload so the theme list reflects the custom themes loaded.
 */
export class ShikiSettingsTab extends PluginSettingTab {
	private readonly store: SettingsTabStore;
	private readonly source: ThemeLanguageSource;
	private readonly reloads: ReloadScheduler;

	constructor(plugin: Plugin, store: SettingsTabStore, source: ThemeLanguageSource, reloads: ReloadScheduler) {
		super(plugin.app, plugin);

		this.store = store;
		this.source = source;
		this.reloads = reloads;
	}

	getControlValue(key: string): unknown {
		return this.store.persisted[key as keyof Settings];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		// keys come only from the control definitions below, which are typed against Settings
		await this.save(key as keyof Settings, value as Settings[keyof Settings]);
	}

	getSettingDefinitions(): SettingDefinitionItem<keyof Settings>[] {
		const customThemes = Object.fromEntries(this.source.getCustomThemes().map(theme => [theme.name, `${theme.displayName} (${theme.type})`]));
		const builtInThemes = Object.fromEntries(bundledThemesInfo.map(theme => [theme.id, `${theme.displayName} (${theme.type})`]));
		const themes = {
			[OBSIDIAN_THEME_IDENTIFIER]: 'Obsidian built-in (both)',
			...customThemes,
			...builtInThemes,
		};
		const excluded = this.store.persisted.disabledLanguages;

		return [
			{
				name: 'Inline syntax highlighting',
				desc: 'Enables syntax highlighting for inline code blocks via `{lang} code`.',
				control: { type: 'toggle', key: 'inlineHighlighting' },
			},
			{
				type: 'group',
				heading: 'EC defaults',
				items: [
					{
						name: 'Show line numbers',
						desc: 'Controls whether line numbers are shown by default.',
						control: { type: 'toggle', key: 'ecDefaultShowLineNumbers' },
					},
					{
						name: 'Wrap',
						desc: 'Controls whether code block lines wrap by default.',
						control: { type: 'toggle', key: 'ecDefaultWrap' },
					},
					{
						name: 'Frame',
						desc: 'Controls the default frame type for code blocks.',
						control: {
							type: 'dropdown',
							key: 'ecDefaultFrame',
							options: {
								[FrameType.Code]: 'Code',
								[FrameType.Terminal]: 'Terminal',
								[FrameType.None]: 'None',
								[FrameType.Auto]: 'Auto',
							},
						},
					},
				],
			},
			{
				type: 'group',
				heading: 'Theme',
				items: [
					{
						name: 'Dark theme',
						desc: "The theme for code blocks when Obsidian's base color scheme is dark.",
						control: { type: 'dropdown', key: 'darkTheme', options: themes },
					},
					{
						name: 'Light theme',
						desc: "The theme for code blocks when Obsidian's base color scheme is light.",
						control: { type: 'dropdown', key: 'lightTheme', options: themes },
					},
					{
						name: 'Custom themes folder location',
						desc: 'Folder in your vault containing custom JSON theme files.',
						control: { type: 'folder', key: 'customThemeFolder', includeRoot: true },
					},
					{
						name: 'Open custom themes folder',
						visible: Platform.isDesktopApp,
						action: () => void this.openFolder(this.store.persisted.customThemeFolder, 'themes'),
					},
					{
						name: 'Prefer theme colors',
						desc: 'Prefer theme colors over CSS variables for things like the code block background.',
						control: { type: 'toggle', key: 'preferThemeColors' },
					},
				],
			},
			{
				type: 'group',
				heading: 'Languages',
				items: [
					{
						name: 'Custom languages folder location',
						desc: 'Folder in your vault containing custom JSON language files.',
						control: { type: 'folder', key: 'customLanguageFolder', includeRoot: true },
					},
					{
						name: 'Open custom languages folder',
						visible: Platform.isDesktopApp,
						action: () => void this.openFolder(this.store.persisted.customLanguageFolder, 'languages'),
					},
				],
			},
			{
				type: 'list',
				heading: 'Excluded languages',
				emptyState: 'No excluded languages.',
				addItem: {
					name: 'Exclude language',
					action: (): void => {
						new StringSelectModal(this.app, excludableLanguages(this.source.supportedLanguages, excluded), language => {
							void this.excludeLanguage(language);
						}).open();
					},
				},
				onDelete: (index): void => {
					void this.saveExcluded(excluded.filter((_, i) => i !== index));
				},
				items: excluded.map(language => ({ name: language })),
			},
		];
	}

	/** Adds `language` to the excluded list; a language already there is left alone. */
	async excludeLanguage(language: string): Promise<void> {
		const excluded = this.store.persisted.disabledLanguages;
		if (excluded.includes(language)) return;
		await this.saveExcluded([...excluded, language]);
	}

	private async saveExcluded(languages: string[]): Promise<void> {
		await this.save('disabledLanguages', languages);
		this.update();
	}

	private async save<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
		if (await this.store.update(key, value)) this.reloads.scheduleReload();
	}

	private async openFolder(path: string, kind: string): Promise<void> {
		const folder = normalizePath(path);
		if (await this.app.vault.adapter.exists(folder)) {
			this.app.openWithDefaultApp(folder);
		} else {
			new Notice(`Unable to open custom ${kind} folder: ${folder}`, 5000);
		}
	}
}
