// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import only_warn from 'eslint-plugin-only-warn';
import { importX } from 'eslint-plugin-import-x';
import no_relative_import_paths from 'eslint-plugin-no-relative-import-paths';
import obsidianmd from 'eslint-plugin-obsidianmd';

export default defineConfig(
	{
		ignores: ['npm/', 'node_modules/', 'exampleVault/', 'automation/', 'main.js', '*.svelte'],
	},
	{
		files: ['packages/**/*.ts'],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: true,
			},
		},
		plugins: {
			// @ts-ignore
			'only-warn': only_warn,
			'no-relative-import-paths': no_relative_import_paths,
			import: importX,
			obsidianmd: obsidianmd,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': ['warn'],

			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],

			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
			'@typescript-eslint/restrict-template-expressions': 'off',

			'no-relative-import-paths/no-relative-import-paths': ['warn', { allowSameFolder: false }],

			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/explicit-function-return-type': ['warn'],
			'@typescript-eslint/require-await': 'off',

			// obsidianmd recommended rules
			'obsidianmd/commands/no-command-in-command-id': 'warn',
			'obsidianmd/commands/no-command-in-command-name': 'warn',
			'obsidianmd/commands/no-default-hotkeys': 'warn',
			'obsidianmd/commands/no-plugin-id-in-command-id': 'warn',
			'obsidianmd/commands/no-plugin-name-in-command-name': 'warn',
			'obsidianmd/settings-tab/no-manual-html-headings': 'warn',
			'obsidianmd/settings-tab/no-problematic-settings-headings': 'warn',
			'obsidianmd/vault/iterate': 'warn',
			'obsidianmd/detach-leaves': 'warn',
			'obsidianmd/editor-drop-paste': 'warn',
			'obsidianmd/hardcoded-config-path': 'warn',
			'obsidianmd/no-forbidden-elements': 'warn',
			'obsidianmd/no-global-this': 'warn',
			'obsidianmd/no-plugin-as-component': 'warn',
			'obsidianmd/no-sample-code': 'warn',
			'obsidianmd/no-tfile-tfolder-cast': 'warn',
			'obsidianmd/no-static-styles-assignment': 'warn',
			'obsidianmd/object-assign': 'warn',
			'obsidianmd/platform': 'warn',
			'obsidianmd/prefer-get-language': 'warn',
			'obsidianmd/prefer-abstract-input-suggest': 'warn',
			'obsidianmd/prefer-window-timers': 'warn',
			'obsidianmd/prefer-active-doc': 'warn',
			'obsidianmd/regex-lookbehind': 'warn',
			'obsidianmd/sample-names': 'warn',
			'obsidianmd/validate-manifest': 'warn',
			'obsidianmd/validate-license': 'warn',
			'obsidianmd/ui/sentence-case': ['warn', { acronyms: ['EC', 'JSON', 'CSS'] }],
			// TS-only obsidianmd rules
			'obsidianmd/no-view-references-in-plugin': 'warn',
			'obsidianmd/no-unsupported-api': 'warn',
			'obsidianmd/prefer-file-manager-trash-file': 'warn',
			'obsidianmd/prefer-instanceof': 'warn',
		},
	},
);
