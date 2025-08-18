import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		setupFiles: './functions/tests/setup.ts',
	},
});
