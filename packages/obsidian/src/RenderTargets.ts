export interface RenderTarget {
	/** Targets with a sourcePath are note-bound blocks; they refresh before targets without one (CM6 views). */
	readonly sourcePath?: string;
	refresh(): Promise<void>;
	/** Present only on targets that must rerender when their note is modified. */
	onNoteChange?(): Promise<void>;
}

/** What a render target needs to register itself; satisfied by `RenderTargets`. */
export type RenderTargetRegistry = Pick<RenderTargets, 'register'>;

export interface RenderTargetsHost {
	reloadHighlighter(): Promise<void>;
	/** Runs after the highlighter reloads and before targets refresh; skipped once disposed. */
	afterReload?(): void;
}

/**
 * Owns every live render target and the reload sequence: highlighter first, then note-bound
 * blocks, then CM6 views. Reload requests that arrive mid-reload coalesce into one trailing run.
 */
export class RenderTargets {
	private readonly host: RenderTargetsHost;
	private readonly byPath = new Map<string, RenderTarget[]>();
	private readonly unkeyed = new Set<RenderTarget>();
	private current: Promise<void> | null = null;
	private pending = false;
	private disposed = false;

	constructor(host: RenderTargetsHost) {
		this.host = host;
	}

	register(target: RenderTarget): () => void {
		const path = target.sourcePath;
		if (path === undefined) {
			this.unkeyed.add(target);
		} else {
			const list = this.byPath.get(path);
			if (list) list.push(target);
			else this.byPath.set(path, [target]);
		}

		return (): void => {
			if (path === undefined) {
				this.unkeyed.delete(target);
				return;
			}
			const list = this.byPath.get(path);
			if (!list) return;
			const index = list.indexOf(target);
			if (index !== -1) list.splice(index, 1);
			if (list.length === 0) this.byPath.delete(path);
		};
	}

	reload(): Promise<void> {
		if (this.disposed) return Promise.resolve();
		if (this.current) {
			this.pending = true;
			return this.current;
		}
		this.current = this.runReloads().finally(() => {
			this.current = null;
		});
		return this.current;
	}

	rerenderFor(sourcePath: string): void {
		for (const target of [...(this.byPath.get(sourcePath) ?? [])]) {
			if (target.onNoteChange) void this.isolate(target, () => target.onNoteChange!());
		}
	}

	private async runReloads(): Promise<void> {
		do {
			this.pending = false;
			await this.host.reloadHighlighter();
			// plugin unloaded mid-reload: its processors and settings tab are gone and the targets
			// are being torn down, so neither the post-reload step nor a refresh may run
			if (this.disposed) return;
			this.host.afterReload?.();

			for (const targets of [...this.byPath.values()]) {
				for (const target of [...targets]) {
					await this.isolate(target, () => target.refresh());
				}
			}

			for (const target of [...this.unkeyed]) {
				await this.isolate(target, () => target.refresh());
			}
		} while (this.pending);
	}

	/**
	 * Refuses further reloads; a queued trailing run is dropped by the check after `reloadHighlighter`. Resolves once a reload already in progress
	 * has finished (even if it failed), so the caller can unload the highlighter without racing it.
	 */
	dispose(): Promise<void> {
		this.disposed = true;
		return (this.current ?? Promise.resolve()).catch(() => {});
	}

	private async isolate(target: RenderTarget, run: () => Promise<void>): Promise<void> {
		try {
			await run();
		} catch (e) {
			console.warn(`Failed to refresh render target${target.sourcePath ? ` in ${target.sourcePath}` : ''}.`, e);
		}
	}
}
