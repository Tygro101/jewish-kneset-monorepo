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
      // Allow access to the monorepo shared folder and the project root/src
      allow: [shardFolderDir, rootDir, resolve(__dirname)]
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
