import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  
  outDir: 'dist',
  clean: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  sourcemap: true,
 
  //bundle all monorepo packages
  noExternal: [
    '@repo/db',
    '@repo/trpc',
    '@repo/tsconfig'
  ],
});