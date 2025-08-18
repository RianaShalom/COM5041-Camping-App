import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: './functions/tests/setup.ts',
    // coverage: {
    //   reportsDirectory: '../../tests-coverage/unit/components/manager',
    // },
  },
});