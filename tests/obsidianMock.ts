import { mock } from 'bun:test';
import Moment from 'moment';

mock.module('obsidian', () => ({
	setIcon(_iconEl: HTMLElement, _iconName: string): void {},
	moment: Moment,
	MarkdownRenderChild: class {
		containerEl: HTMLElement;
		constructor(containerEl: HTMLElement) {
			this.containerEl = containerEl;
		}
		onload(): void {}
		onunload(): void {}
		register(_cb: () => void): void {}
	},
}));
