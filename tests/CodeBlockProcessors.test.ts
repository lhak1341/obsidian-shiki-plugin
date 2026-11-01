import { describe, expect, test } from 'bun:test';
import { CodeBlockProcessors, type ProcessorRegistrar } from 'packages/obsidian/src/CodeBlockProcessors';

interface FakeProcessor {
	language: string;
}

function makeRegistrar(failOn: string[] = []): ProcessorRegistrar<FakeProcessor> & { registered: Set<FakeProcessor>; created: string[] } {
	const registered = new Set<FakeProcessor>();
	const created: string[] = [];
	return {
		registered,
		created,
		create(language) {
			if (failOn.includes(language)) throw new Error(`cannot register ${language}`);
			created.push(language);
			return { language };
		},
		register(processor) {
			registered.add(processor);
		},
		unregister(processor) {
			registered.delete(processor);
		},
	};
}

const languagesOf = (registered: Set<FakeProcessor>): string[] => [...registered].map(p => p.language).sort();

describe('CodeBlockProcessors', () => {
	test('first sync registers every language and reports a change', () => {
		const registrar = makeRegistrar();
		const processors = new CodeBlockProcessors(registrar);

		expect(processors.sync(['js', 'ts'])).toBe(true);
		expect(languagesOf(registrar.registered)).toEqual(['js', 'ts']);
	});

	test('a newly excluded language is unregistered', () => {
		const registrar = makeRegistrar();
		const processors = new CodeBlockProcessors(registrar);
		processors.sync(['js', 'ts']);

		expect(processors.sync(['ts'])).toBe(true);
		expect(languagesOf(registrar.registered)).toEqual(['ts']);
		expect(processors.has('js')).toBe(false);
	});

	test('a newly added custom language is registered without recreating the others', () => {
		const registrar = makeRegistrar();
		const processors = new CodeBlockProcessors(registrar);
		processors.sync(['js']);

		expect(processors.sync(['js', 'mylang'])).toBe(true);
		expect(languagesOf(registrar.registered)).toEqual(['js', 'mylang']);
		expect(registrar.created).toEqual(['js', 'mylang']);
	});

	test('an unchanged set reports no change', () => {
		const processors = new CodeBlockProcessors(makeRegistrar());
		processors.sync(['js', 'ts']);

		expect(processors.sync(['ts', 'js'])).toBe(false);
	});

	test('a language whose registration throws is skipped and retried on the next sync', () => {
		const registrar = makeRegistrar(['bad']);
		const processors = new CodeBlockProcessors(registrar);

		expect(processors.sync(['js', 'bad'])).toBe(true);
		expect(languagesOf(registrar.registered)).toEqual(['js']);
		expect(processors.has('bad')).toBe(false);
	});

	test('clear unregisters everything', () => {
		const registrar = makeRegistrar();
		const processors = new CodeBlockProcessors(registrar);
		processors.sync(['js', 'ts']);

		processors.clear();
		expect(registrar.registered.size).toBe(0);
		expect(processors.sync(['js'])).toBe(true);
	});
});
