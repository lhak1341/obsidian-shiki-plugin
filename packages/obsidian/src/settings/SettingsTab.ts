import { PluginSettingTab, Setting, Platform, Notice, normalizePath } from 'obsidian';
import type ShikiPlugin from 'packages/obsidian/src/main';
import { StringSelectModal } from 'packages/obsidian/src/settings/StringSelectModal';
import { bundledThemesInfo } from 'shiki';
import { OBSIDIAN_THEME_IDENTIFIER } from 'packages/obsidian/src/constants';
import { FrameType } from 'packages/obsidian/src/settings/Settings';

export class ShikiSettingsTab extends PluginSettingTab {
	plugin: ShikiPlugin;

	constructor(plugin: ShikiPlugin) {
		super(plugin.app, plugin);

		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		const customThemes = Object.fromEntries(this.plugin.getCustomThemes().map(theme => [theme.name, `${theme.displayName} (${theme.type})`]));
		const builtInThemes = Object.fromEntries(bundledThemesInfo.map(theme => [theme.id, `${theme.displayName} (${theme.type})`]));
		const themes = {
			[OBSIDIAN_THEME_IDENTIFIER]: 'Obsidian built-in (both)',
			...customThemes,
			...builtInThemes,
		};

		new Setting(this.containerEl).setName('Most changes require a reload of the highlighter').addButton(button => {
			button
				.setCta()
				.setButtonText('Reload highlighter')
				.onClick(async () => {
					button.setDisabled(true);
					await this.plugin.reloadHighlighter();
					button.setDisabled(false);
				});
		});

		new Setting(this.containerEl)
			.setName('Inline syntax highlighting')
			.setDesc('Enables syntax highlighting for inline code blocks via `{lang} code`. Takes effect immediately.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.store.persisted.inlineHighlighting).onChange(async value => {
					await this.plugin.store.setLive('inlineHighlighting', value);
				});
			});

		new Setting(this.containerEl).setName('EC defaults').setHeading();

		new Setting(this.containerEl)
			.setName('Show line numbers')
			.setDesc('Controls whether line numbers are shown by default.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.store.persisted.ecDefaultShowLineNumbers).onChange(async value => {
					await this.plugin.store.set('ecDefaultShowLineNumbers', value);
				});
			});

		new Setting(this.containerEl)
			.setName('Wrap')
			.setDesc('Controls whether code block lines wrap by default.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.store.persisted.ecDefaultWrap).onChange(async value => {
					await this.plugin.store.set('ecDefaultWrap', value);
				});
			});

		new Setting(this.containerEl)
			.setName('Frame')
			.setDesc('Controls the default frame type for code blocks.')
			.addDropdown(dropdown => {
				dropdown.addOptions({
					[FrameType.Code]: 'Code',
					[FrameType.Terminal]: 'Terminal',
					[FrameType.None]: 'None',
					[FrameType.Auto]: 'Auto',
				});
				dropdown.setValue(this.plugin.store.persisted.ecDefaultFrame).onChange(async value => {
					await this.plugin.store.set('ecDefaultFrame', value as FrameType);
				});
			});

		new Setting(this.containerEl).setName('Theme').setHeading();

		new Setting(this.containerEl)
			.setName('Dark theme')
			.setDesc("The theme for code blocks when Obsidian's base color scheme is dark.")
			.addDropdown(dropdown => {
				dropdown.addOptions(themes);
				dropdown.setValue(this.plugin.store.persisted.darkTheme).onChange(async value => {
					await this.plugin.store.set('darkTheme', value);
				});
			});

		new Setting(this.containerEl)
			.setName('Light theme')
			.setDesc("The theme for code blocks when Obsidian's base color scheme is light.")
			.addDropdown(dropdown => {
				dropdown.addOptions(themes);
				dropdown.setValue(this.plugin.store.persisted.lightTheme).onChange(async value => {
					await this.plugin.store.set('lightTheme', value);
				});
			});

		const customThemeFolderSetting = new Setting(this.containerEl)
			.setName('Custom themes folder location')
			.setDesc('Folder relative to your vault where custom JSON theme files are located.')
			.addText(textbox => {
				textbox.setValue(this.plugin.store.persisted.customThemeFolder).onChange(async value => {
					await this.plugin.store.set('customThemeFolder', value);
				});
				textbox.inputEl.addClass('shiki-custom-theme-folder');
			});

		new Setting(this.containerEl)
			.setName('Prefer theme colors')
			.setDesc('When enabled the plugin will prefer theme colors over CSS variables for things like the code block background.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.store.persisted.preferThemeColors).onChange(async value => {
					await this.plugin.store.set('preferThemeColors', value);
				});
			});

		new Setting(this.containerEl).setHeading().setName('Languages');

		const customLanguageFolderSetting = new Setting(this.containerEl)
			.setName('Custom languages folder location')
			.setDesc('Folder relative to your vault where custom JSON language files are located.')
			.addText(textbox => {
				textbox.setValue(this.plugin.store.persisted.customLanguageFolder).onChange(async value => {
					await this.plugin.store.set('customLanguageFolder', value);
				});
				textbox.inputEl.addClass('shiki-custom-language-folder');
			});

		new Setting(this.containerEl)
			.setName('Excluded languages')
			.setDesc('Configure language to exclude.')
			.addButton(button => {
				button.setButtonText('Add language rule').onClick(() => {
					const modal = new StringSelectModal(this.app, this.plugin.getSupportedLanguages(), language => {
						void this.plugin.store.set('disabledLanguages', [...this.plugin.store.persisted.disabledLanguages, language]);
						this.display();
					});
					modal.open();
				});
			});

		for (const language of this.plugin.store.persisted.disabledLanguages) {
			new Setting(this.containerEl).setName(language).addButton(button => {
				button
					.setIcon('trash')
					.setWarning()
					.onClick(() => {
						void this.plugin.store.set(
							'disabledLanguages',
							this.plugin.store.persisted.disabledLanguages.filter(x => x !== language),
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
						const themeFolder = normalizePath(this.plugin.store.persisted.customThemeFolder);
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
						const languageFolder = normalizePath(this.plugin.store.persisted.customLanguageFolder);
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
