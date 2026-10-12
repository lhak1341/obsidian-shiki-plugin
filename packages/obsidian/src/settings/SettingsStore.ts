import { DEFAULT_SETTINGS, LIVE_SETTINGS, type Settings } from 'packages/obsidian/src/settings/Settings';

export class SettingsStore {
	private _persisted: Settings;
	private _snapshot: Settings;
	private readonly _save: () => Promise<void>;

	constructor(initial: Settings, save: () => Promise<void>) {
		this._persisted = initial;
		this._snapshot = structuredClone(initial);
		this._save = save;
	}

	get persisted(): Readonly<Settings> {
		return this._persisted;
	}

	get snapshot(): Readonly<Settings> {
		return this._snapshot;
	}

	/** Saves a user edit. Settings in `LIVE_SETTINGS` reach the snapshot now, the rest on the next flush. */
	async update<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
		this._persisted[key] = value;
		if (LIVE_SETTINGS.has(key)) this._snapshot[key] = value;
		await this._save();
	}

	/** Replaces a stored value that proved invalid with its default, in the snapshot too, so a load in progress uses it. */
	async reset<K extends keyof Settings>(key: K): Promise<void> {
		this._persisted[key] = structuredClone(DEFAULT_SETTINGS[key]);
		this._snapshot[key] = structuredClone(DEFAULT_SETTINGS[key]);
		await this._save();
	}

	flush(): void {
		this._snapshot = structuredClone(this._persisted);
	}
}
