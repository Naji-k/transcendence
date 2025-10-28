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
  
  external: [
    '@babylonjs/core',
    "@babylonjs/havok",
    "@fastify/cookie",
    "@fastify/websocket",
    "@libsql/client",
    "@trpc/server",
    "argon2",
    "dotenv",
    "drizzle-kit",
    "drizzle-orm",
    "drizzle-seed",
    "fastify",
    "jsonwebtoken",
    "nodemon",
    "otplib",
    "pino",
    "@fastify/cors",
    "@types/jsonwebtoken",
    "@types/node",
    "dotenv",
    "ts-node",
    "ts-node-dev",
    "tsup",
    "tsx",
    "typescript",
  ],
});