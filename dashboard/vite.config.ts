import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';

const shardFolder = resolve(__dirname, "..","shared","src");
console.log("********************",shardFolder)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": shardFolder
    }
  },
  server: {
    open: false,
    port: 3000, 
    fs: {
      allow: [`${shardFolder}/*`]
    }
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  test: { 
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
    mockReset: true,
  },
})
