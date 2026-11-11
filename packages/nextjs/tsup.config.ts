import { defineConfig } from 'tsup';

export default defineConfig([
  // 1. Server entry (@pkpayplus/nextjs/server)
  {
    entry: {
      server: 'src/server.ts',
    },
    outDir: 'dist',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node24',
    external: ['next', 'react', 'react-dom'],
  },

  // 2. Client & Root entries (@pkpayplus/nextjs and @pkpayplus/nextjs/client)
  {
    entry: {
      index: 'src/index.ts',
      client: 'src/client.tsx',
    },
    outDir: 'dist',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    target: 'es2022',
    external: ['next', 'react', 'react-dom'],
    banner: {
      js: '"use client";',
    },
  },
]);

