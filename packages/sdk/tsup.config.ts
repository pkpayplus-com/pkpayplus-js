import { defineConfig } from 'tsup';

export default defineConfig([
  // 1. Unified Node / Core export
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node24',
  },

  // 2. Standalone Browser CDN build for <script> tags
  {
    entry: {
      'pkpayplus.global.min': 'src/cdn.ts',
    },
    outDir: 'dist/cdn',
    format: ['iife'],
    globalName: 'PKPayPlus',
    minify: true,
    sourcemap: false,
    target: 'es2020',
  },
]);

