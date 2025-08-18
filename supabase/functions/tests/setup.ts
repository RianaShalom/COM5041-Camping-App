(globalThis as any).Deno = {
	serve: () => {},
	env: { get: () => 'fake-key' },
};
