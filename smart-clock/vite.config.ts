import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from 'path';

const shardFolderDir = resolve(__dirname, "..","shared","src");
const shardReactFolderDir = resolve(__dirname, "..","shared-react","src");
const rootDir = resolve(__dirname,"src");
// https://vitejs.dev/config/
export default defineConfig({
  base: "/jewish-kneset-monorepo/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // we register manually in main.tsx
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ttf,otf,woff,woff2,png,ico}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // fonts are large
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Tenant config.json: network is authoritative so a deactivated
            // presentation disappears on the very next poll. The cached copy is
            // only a fallback for offline / slow network (5s timeout).
            // The cache key drops the `?t=` cache-buster so we keep one entry per tenant.
            urlPattern: ({ url }) =>
              url.hostname.endsWith('github.io') && url.pathname.endsWith('config.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tenant-config',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 4 },
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    const u = new URL(request.url);
                    u.search = '';
                    return u.toString();
                  },
                },
              ],
            },
          },
          {
            // Tenant presentations (PDFs, images) from GitHub Pages.
            // CacheFirst + long retention: uploaded file names carry a Date.now()
            // prefix so they are effectively immutable, and pruneMediaCache()
            // authoritatively removes entries no longer in the active config.
            // Long cache = offline / Shabbat resilience.
            urlPattern: ({ url }) =>
              url.hostname.endsWith('github.io') &&
              /\.(pdf|png|jpe?g|gif|webp)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tenant-presentations',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
            },
          },
        ],
      },
      manifest: {
        name: 'Smart Clock',
        short_name: 'SmartClock',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@root": rootDir,
      "@shared":  shardFolderDir,
      "@shared-react": shardReactFolderDir,
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    open: false,
    port: 3001, 
    fs: {
      // Allow access to the monorepo shared folder and the project root/src
      allow: [shardFolderDir, shardReactFolderDir, rootDir, resolve(__dirname)]
    }
  },
  build: {
    outDir: "build",
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    }
  },
  test: { 
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
    mockReset: true,
  },
})
