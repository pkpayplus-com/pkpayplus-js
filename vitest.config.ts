import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['tests/server/**', 'node'],
      ['tests/client/**', 'happy-dom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'tests'],
    },
  },
  resolve: {
    alias: {
      '@pkpayplus/core': path.resolve(__dirname, './packages/core/src/index.ts'),
      '@pkpayplus/node': path.resolve(__dirname, './packages/node/src/index.ts'),
      '@pkpayplus/react': path.resolve(__dirname, './packages/react/src/index.ts'),
      '@pkpayplus/nextjs': path.resolve(__dirname, './packages/nextjs/src/index.ts'),
      '@pkpayplus/vue': path.resolve(__dirname, './packages/vue/src/index.ts'),
      '@pkpayplus/svelte': path.resolve(__dirname, './packages/svelte/src/index.ts'),
      '@pkpayplus/astro': path.resolve(__dirname, './packages/astro/src/index.ts'),
      '@pkpayplus/sdk': path.resolve(__dirname, './packages/sdk/src/index.ts'),
    },
  },
});
