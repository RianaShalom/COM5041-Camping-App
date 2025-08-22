interface DenoMock {
	serve: () => void;
	env: {
		get: (key: string) => string;
	};
}

declare global {
	const Deno: DenoMock;
}

globalThis.Deno = {
	serve: () => {},
	env: { get: () => 'fake-key' },
}