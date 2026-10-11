import type { LanguageRegistration } from 'shiki';
import { normalizePath } from 'obsidian';

export interface CustomTheme {
	name: string;
	displayName: string;
	type: string;
	colors?: Record<string, unknown>[];
	tokenColors?: Record<string, unknown>[];
}

export interface CustomAssetsHost {
	vaultExists(path: string): Promise<boolean>;
	vaultList(path: string): Promise<{ files: string[] }>;
	vaultRead(path: string): Promise<string>;
	notify(message: string): void;
}

export interface CustomAssetsInput {
	themeFolder: string;
	languageFolder: string;
	darkTheme: string;
	lightTheme: string;
}

export interface CustomAssets {
	themes: CustomTheme[];
	languages: LanguageRegistration[];
	/** Modes whose selected custom theme file is missing; the caller resets them to the default. */
	modesToReset: ('dark' | 'light')[];
}

/**
 * Reads custom themes and languages from the vault folders in `input`. Unreadable or invalid
 * files are reported through `host.notify` and skipped; they never abort the load.
 */
export async function loadCustomAssets(host: CustomAssetsHost, input: CustomAssetsInput): Promise<CustomAssets> {
	const themes = await loadThemes(host, input.themeFolder);
	const languages = await loadLanguages(host, input.languageFolder);

	// check both modes so a mode-switch after the folder is emptied (or unset) doesn't crash on load
	const modesToReset: ('dark' | 'light')[] = [];
	for (const mode of ['dark', 'light'] as const) {
		const themeId = mode === 'dark' ? input.darkTheme : input.lightTheme;
		if (themeId.endsWith('.json') && !themes.some(t => t.name === themeId)) {
			modesToReset.push(mode);
		}
	}

	return { themes, languages, modesToReset };
}

async function listJsonFiles(host: CustomAssetsHost, folder: string, kind: string): Promise<string[]> {
	const normalized = normalizePath(folder);
	if (!(await host.vaultExists(normalized))) {
		host.notify(`Unable to open custom ${kind} folder: ${normalized}`);
		return [];
	}
	const listing = await host.vaultList(normalized);
	return listing.files.filter(f => f.toLowerCase().endsWith('.json'));
}

async function loadLanguages(host: CustomAssetsHost, folder: string): Promise<LanguageRegistration[]> {
	if (!folder) return [];

	const languages: LanguageRegistration[] = [];

	for (const languageFile of await listJsonFiles(host, folder, 'languages')) {
		try {
			const language = JSON.parse(await host.vaultRead(languageFile)) as LanguageRegistration;
			// validate that language file JSON can be parsed and contains at a minimum a name
			if (!language.name) {
				throw Error('Invalid JSON language file is missing a name property.');
			}

			languages.push(language);
		} catch (e) {
			host.notify(`Unable to load custom language: ${languageFile}`);
			console.warn(`Unable to load custom language: ${languageFile}`, e);
		}
	}

	return languages;
}

async function loadThemes(host: CustomAssetsHost, folder: string): Promise<CustomTheme[]> {
	// custom themes are disabled unless users specify a folder for them in plugin settings
	if (!folder) return [];

	const themes: CustomTheme[] = [];
	const themeFolder = normalizePath(folder);

	for (const themeFile of await listJsonFiles(host, folder, 'themes')) {
		const baseName = themeFile.substring(`${themeFolder}/`.length);
		try {
			const theme = JSON.parse(await host.vaultRead(themeFile)) as CustomTheme;
			// validate that theme file JSON can be parsed and contains colors at a minimum
			if (!theme.colors && !theme.tokenColors) {
				throw Error('Invalid JSON theme file.');
			}
			// what metadata is available in the theme file depends on how it was created
			theme.displayName = theme.displayName ?? theme.name ?? baseName;
			theme.name = baseName.toLowerCase();
			theme.type = theme.type ?? 'both';

			themes.push(theme);
		} catch (e) {
			host.notify(`Unable to load custom theme: ${themeFile}`);
			console.warn(`Unable to load custom theme: ${themeFile}`, e);
		}
	}

	return themes.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
