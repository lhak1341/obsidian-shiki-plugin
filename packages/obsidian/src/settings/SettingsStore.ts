import type { Settings } from 'packages/obsidian/src/settings/Settings';

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

	async set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
		this._persisted[key] = value;
		await this._save();
	}

	async setLive<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
		this._persisted[key] = value;
		this._snapshot[key] = value;
		await this._save();
	}

	flush(): void {
		this._snapshot = structuredClone(this._persisted);
	}
}
