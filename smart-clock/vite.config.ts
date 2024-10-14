import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';

const shardFolderDir = resolve(__dirname, "..","shared","src");
const rootDir = resolve(__dirname,"src");
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@root": rootDir,
      "@shared":  shardFolderDir
    }
  },
  server: {
    open: false,
    port: 3001, 
    fs: {
      allow: ['../shared/src', "./src"]
    }
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      input: {
        
      }
    }
  },
  test: { 
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
    mockReset: true,
  },
})
