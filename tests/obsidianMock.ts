import { mock } from 'bun:test';
import Moment from 'moment';

mock.module('obsidian', () => ({
	setIcon(_iconEl: HTMLElement, _iconName: string): void {},
	moment: Moment,
	normalizePath(path: string): string {
		return path.replace(/[\\/]+/g, '/').replace(/^\/+|\/+$/g, '') || '/';
	},
	MarkdownRenderChild: class {
		containerEl: HTMLElement;
		constructor(containerEl: HTMLElement) {
			this.containerEl = containerEl;
		}
		onload(): void {}
		onunload(): void {}
		register(_cb: () => void): void {}
	},
	PluginSettingTab: class {
		app: unknown;
		constructor(app: unknown, _plugin: unknown) {
			this.app = app;
		}
		update(): void {}
	},
	FuzzySuggestModal: class {
		constructor(_app: unknown) {}
		open(): void {}
	},
	Platform: { isDesktopApp: false },
	Notice: class {},
}));
