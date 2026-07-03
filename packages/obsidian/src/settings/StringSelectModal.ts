import { App, FuzzySuggestModal } from 'obsidian';

export class StringSelectModal extends FuzzySuggestModal<string> {
	items: string[];
	onSelect: (item: string) => void;

	constructor(app: App, items: string[], onSelect: (item: string) => void) {
		super(app);

		this.items = items;
		this.onSelect = onSelect;
	}

	public getItemText(item: string): string {
		return item;
	}

	public getItems(): string[] {
		return this.items;
	}

	public onChooseItem(item: string, _evt: MouseEvent | KeyboardEvent): void {
		this.onSelect(item);
	}
}
