import { describe, test, expect, mock, spyOn } from 'bun:test';
import { loadCustomAssets, type CustomAssetsHost, type CustomAssetsInput } from 'packages/obsidian/src/CustomAssets';

const makeVault = (
	files: Record<string, string>,
	folders: string[] = [],
): CustomAssetsHost & { notices: string[]; exists: ReturnType<typeof mock>; list: ReturnType<typeof mock> } => {
	const notices: string[] = [];
	const exists = mock(async (path: string) => folders.includes(path));
	const list = mock(async (path: string) => ({ files: Object.keys(files).filter(f => f.startsWith(`${path}/`)) }));
	return {
		notices,
		exists,
		list,
		vaultExists: exists,
		vaultList: list,
		vaultRead: async (path: string) => files[path],
		notify: (message: string) => void notices.push(message),
	};
};

const input = (overrides: Partial<CustomAssetsInput> = {}): CustomAssetsInput => ({
	themeFolder: '',
	languageFolder: '',
	darkTheme: 'obsidian',
	lightTheme: 'obsidian',
	...overrides,
});

const themeJson = (extra: Record<string, unknown> = {}): string => JSON.stringify({ colors: [{}], ...extra });

describe('loadCustomAssets', () => {
	test('no folders set: no vault calls, empty results', async () => {
		const vault = makeVault({});
		const result = await loadCustomAssets(vault, input());

		expect(result).toEqual({ themes: [], languages: [], modesToReset: [] });
		expect(vault.exists.mock.calls.length).toBe(0);
		expect(vault.list.mock.calls.length).toBe(0);
	});

	test('missing folder: one notice with the folder path, empty results', async () => {
		const vault = makeVault({}, []);
		const result = await loadCustomAssets(vault, input({ themeFolder: 'themes/' }));

		expect(result.themes).toEqual([]);
		expect(vault.notices).toEqual(['Unable to open custom themes folder: themes']);
	});

	test('non-json files are ignored, json matched case-insensitively', async () => {
		const vault = makeVault({ 'themes/a.json': themeJson(), 'themes/b.JSON': themeJson(), 'themes/readme.md': 'x' }, ['themes']);
		const result = await loadCustomAssets(vault, input({ themeFolder: 'themes' }));

		expect(result.themes.map(t => t.name)).toEqual(['a.json', 'b.json']);
		expect(vault.notices).toEqual([]);
	});

	test('invalid files notify with the file path and do not stop the rest', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => {});
		const vault = makeVault(
			{
				'themes/bad-json.json': '{nope',
				'themes/no-colors.json': JSON.stringify({ name: 'x' }),
				'themes/good.json': themeJson(),
				'langs/no-name.json': JSON.stringify({ scopeName: 'source.x' }),
				'langs/good.json': JSON.stringify({ name: 'mylang', scopeName: 'source.my' }),
			},
			['themes', 'langs'],
		);

		const result = await loadCustomAssets(vault, input({ themeFolder: 'themes', languageFolder: 'langs' }));

		expect(result.themes.map(t => t.name)).toEqual(['good.json']);
		expect(result.languages.map(l => l.name)).toEqual(['mylang']);
		expect(vault.notices.sort()).toEqual([
			'Unable to load custom language: langs/no-name.json',
			'Unable to load custom theme: themes/bad-json.json',
			'Unable to load custom theme: themes/no-colors.json',
		]);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	test('theme metadata: displayName falls back to name then file name, name is the lowercased file name, type defaults to both', async () => {
		const vault = makeVault(
			{
				'themes/One.json': themeJson({ displayName: 'Shown', name: 'ignored', type: 'dark' }),
				'themes/Two.json': themeJson({ name: 'Named' }),
				'themes/Three.json': themeJson(),
			},
			['themes'],
		);

		const result = await loadCustomAssets(vault, input({ themeFolder: 'themes' }));
		const byName = Object.fromEntries(result.themes.map(t => [t.name, t]));

		expect(byName['one.json']).toMatchObject({ displayName: 'Shown', type: 'dark' });
		expect(byName['two.json']).toMatchObject({ displayName: 'Named', type: 'both' });
		expect(byName['three.json']).toMatchObject({ displayName: 'Three.json', type: 'both' });
	});

	test('themes are sorted by displayName', async () => {
		const vault = makeVault(
			{
				'themes/a.json': themeJson({ displayName: 'Zebra' }),
				'themes/b.json': themeJson({ displayName: 'Apple' }),
				'themes/c.json': themeJson({ displayName: 'Mango' }),
			},
			['themes'],
		);

		const result = await loadCustomAssets(vault, input({ themeFolder: 'themes' }));

		expect(result.themes.map(t => t.displayName)).toEqual(['Apple', 'Mango', 'Zebra']);
	});

	test('modesToReset: selected custom theme missing from a populated folder', async () => {
		const vault = makeVault({ 'themes/here.json': themeJson() }, ['themes']);
		const result = await loadCustomAssets(vault, input({ themeFolder: 'themes', darkTheme: 'gone.json', lightTheme: 'here.json' }));

		expect(result.modesToReset).toEqual(['dark']);
	});

	test('modesToReset: both modes are checked', async () => {
		const vault = makeVault({}, ['themes']);
		const result = await loadCustomAssets(vault, input({ themeFolder: 'themes', darkTheme: 'a.json', lightTheme: 'b.json' }));

		expect(result.modesToReset).toEqual(['dark', 'light']);
	});

	test('modesToReset: folder unset but a custom theme is still selected', async () => {
		const vault = makeVault({});
		const result = await loadCustomAssets(vault, input({ themeFolder: '', darkTheme: 'gone.json' }));

		expect(result.modesToReset).toEqual(['dark']);
	});

	test('modesToReset: built-in theme ids are never reset', async () => {
		const vault = makeVault({});
		const result = await loadCustomAssets(vault, input({ darkTheme: 'github-dark', lightTheme: 'obsidian' }));

		expect(result.modesToReset).toEqual([]);
	});
});
