import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    allowedHosts: true,
    host: true,
    port: 8080,
    cors: true,
    watch: { usePolling: true },
    fs: {
      allow: ['..', '../..', '../../..'],
    },
  },
  preview: {
    host: true,
    port: 8080,
    cors: true,
  },
});
