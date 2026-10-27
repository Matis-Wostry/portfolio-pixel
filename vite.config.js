import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Autorise l'accès via un tunnel Cloudflare temporaire (test sur téléphone)
    allowedHosts: ['.trycloudflare.com'],
  },
});
