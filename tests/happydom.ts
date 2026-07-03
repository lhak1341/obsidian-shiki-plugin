import { GlobalRegistrator } from '@happy-dom/global-registrator';
import process from 'process';

GlobalRegistrator.register({
	settings: {},
});

if (process.env.LOG_TESTS === 'false') {
	console.log = () => {};
	console.debug = () => {};
}

// Obsidian global functions
(globalThis as any).createDiv = (): HTMLDivElement => document.createElement('div');
(globalThis as any).sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

// Obsidian DOM augmentations
(HTMLElement.prototype as any).empty = function (): void {
	while (this.firstChild) this.removeChild(this.firstChild);
};
