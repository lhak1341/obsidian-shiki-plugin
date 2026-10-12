import { type Plugin, PluginSettingTab, Setting, Platform, Notice, normalizePath } from 'obsidian';
import type { CustomTheme } from 'packages/obsidian/src/CustomAssets';
import { StringSelectModal } from 'packages/obsidian/src/settings/StringSelectModal';
import { bundledThemesInfo } from 'shiki';
import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';
import { FrameType, type Settings } from 'packages/obsidian/src/settings/Settings';

export interface SettingsTabStore {
	readonly persisted: Readonly<Settings>;
	update<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;
}

export interface ThemeLanguageSource {
	getCustomThemes(): CustomTheme[];
	readonly supportedLanguages: string[];
}

export interface HighlighterReloader {
	reload(): Promise<void>;
}

export class ShikiSettingsTab extends PluginSettingTab {
	private readonly store: SettingsTabStore;
	private readonly source: ThemeLanguageSource;
	private readonly reloader: HighlighterReloader;

	constructor(plugin: Plugin, store: SettingsTabStore, source: ThemeLanguageSource, reloader: HighlighterReloader) {
		super(plugin.app, plugin);

		this.store = store;
		this.source = source;
		this.reloader = reloader;
	}

	display(): void {
		this.containerEl.empty();

		const customThemes = Object.fromEntries(this.source.getCustomThemes().map(theme => [theme.name, `${theme.displayName} (${theme.type})`]));
		const builtInThemes = Object.fromEntries(bundledThemesInfo.map(theme => [theme.id, `${theme.displayName} (${theme.type})`]));
		const themes = {
			[OBSIDIAN_THEME_IDENTIFIER]: 'Obsidian built-in (both)',
			...customThemes,
			...builtInThemes,
		};

		const generalItems = this.containerEl.createDiv('setting-group').createDiv('setting-items');

		new Setting(generalItems).setName('Most changes require a reload of the highlighter').addButton(button => {
			button
				.setCta()
				.setButtonText('Reload highlighter')
				.onClick(async () => {
					button.setDisabled(true);
					await this.reloader.reload();
					button.setDisabled(false);
				});
		});

		new Setting(generalItems)
			.setName('Inline syntax highlighting')
			.setDesc('Enables syntax highlighting for inline code blocks via `{lang} code`. Takes effect immediately.')
			.addToggle(toggle => {
				toggle.setValue(this.store.persisted.inlineHighlighting).onChange(async value => {
					await this.store.update('inlineHighlighting', value);
				});
			});

		new Setting(this.containerEl).setName('EC defaults').setHeading();
		const ecDefaultsItems = this.containerEl.createDiv('setting-group').createDiv('setting-items');

		new Setting(ecDefaultsItems)
			.setName('Show line numbers')
			.setDesc('Controls whether line numbers are shown by default.')
			.addToggle(toggle => {
				toggle.setValue(this.store.persisted.ecDefaultShowLineNumbers).onChange(async value => {
					await this.store.update('ecDefaultShowLineNumbers', value);
				});
			});

		new Setting(ecDefaultsItems)
			.setName('Wrap')
			.setDesc('Controls whether code block lines wrap by default.')
			.addToggle(toggle => {
				toggle.setValue(this.store.persisted.ecDefaultWrap).onChange(async value => {
					await this.store.update('ecDefaultWrap', value);
				});
			});

		new Setting(ecDefaultsItems)
			.setName('Frame')
			.setDesc('Controls the default frame type for code blocks.')
			.addDropdown(dropdown => {
				dropdown.addOptions({
					[FrameType.Code]: 'Code',
					[FrameType.Terminal]: 'Terminal',
					[FrameType.None]: 'None',
					[FrameType.Auto]: 'Auto',
				});
				dropdown.setValue(this.store.persisted.ecDefaultFrame).onChange(async value => {
					await this.store.update('ecDefaultFrame', value as FrameType);
				});
			});

		new Setting(this.containerEl).setName('Theme').setHeading();
		const themeItems = this.containerEl.createDiv('setting-group').createDiv('setting-items');

		new Setting(themeItems)
			.setName('Dark theme')
			.setDesc("The theme for code blocks when Obsidian's base color scheme is dark.")
			.addDropdown(dropdown => {
				dropdown.addOptions(themes);
				dropdown.setValue(this.store.persisted.darkTheme).onChange(async value => {
					await this.store.update('darkTheme', value);
				});
			});

		new Setting(themeItems)
			.setName('Light theme')
			.setDesc("The theme for code blocks when Obsidian's base color scheme is light.")
			.addDropdown(dropdown => {
				dropdown.addOptions(themes);
				dropdown.setValue(this.store.persisted.lightTheme).onChange(async value => {
					await this.store.update('lightTheme', value);
				});
			});

		const customThemeFolderSetting = new Setting(themeItems)
			.setName('Custom themes folder location')
			.setDesc('Folder relative to your vault where custom JSON theme files are located.')
			.addText(textbox => {
				textbox.setValue(this.store.persisted.customThemeFolder).onChange(async value => {
					await this.store.update('customThemeFolder', value);
				});
				textbox.inputEl.addClass('shiki-custom-theme-folder');
			});

		new Setting(themeItems)
			.setName('Prefer theme colors')
			.setDesc('When enabled the plugin will prefer theme colors over CSS variables for things like the code block background.')
			.addToggle(toggle => {
				toggle.setValue(this.store.persisted.preferThemeColors).onChange(async value => {
					await this.store.update('preferThemeColors', value);
				});
			});

		new Setting(this.containerEl).setHeading().setName('Languages');
		const languageItems = this.containerEl.createDiv('setting-group').createDiv('setting-items');

		const customLanguageFolderSetting = new Setting(languageItems)
			.setName('Custom languages folder location')
			.setDesc('Folder relative to your vault where custom JSON language files are located.')
			.addText(textbox => {
				textbox.setValue(this.store.persisted.customLanguageFolder).onChange(async value => {
					await this.store.update('customLanguageFolder', value);
				});
				textbox.inputEl.addClass('shiki-custom-language-folder');
			});

		new Setting(languageItems)
			.setName('Excluded languages')
			.setDesc('Configure language to exclude.')
			.addButton(button => {
				button.setButtonText('Add language rule').onClick(() => {
					const modal = new StringSelectModal(this.app, this.source.supportedLanguages, language => {
						void this.store.update('disabledLanguages', [...this.store.persisted.disabledLanguages, language]);
						this.display();
					});
					modal.open();
				});
			});

		for (const language of this.store.persisted.disabledLanguages) {
			new Setting(languageItems).setName(language).addButton(button => {
				button
					.setIcon('trash')
					.setWarning()
					.onClick(() => {
						void this.store.update(
							'disabledLanguages',
							this.store.persisted.disabledLanguages.filter(x => x !== language),
						);
						this.display();
					});
			});
		}

		if (Platform.isDesktopApp) {
			customThemeFolderSetting.addExtraButton(button => {
				button
					.setIcon('folder-open')
					.setTooltip('Open custom themes folder')
					.onClick(async () => {
						const themeFolder = normalizePath(this.store.persisted.customThemeFolder);
						if (await this.app.vault.adapter.exists(themeFolder)) {
							this.app.openWithDefaultApp(themeFolder);
						} else {
							new Notice(`Unable to open custom themes folder: ${themeFolder}`, 5000);
						}
					});
			});

			customLanguageFolderSetting.addExtraButton(button => {
				button
					.setIcon('folder-open')
					.setTooltip('Open custom languages folder')
					.onClick(async () => {
						const languageFolder = normalizePath(this.store.persisted.customLanguageFolder);
						if (await this.app.vault.adapter.exists(languageFolder)) {
							this.app.openWithDefaultApp(languageFolder);
						} else {
							new Notice(`Unable to open custom languages folder: ${languageFolder}`, 5000);
						}
					});
			});
		}
	}
}
