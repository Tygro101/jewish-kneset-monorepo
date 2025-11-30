
import { defineConfig } from 'vite';
import path from 'path';

// Load @vitejs/plugin-react dynamically inside the config function so that
// tools that `require()` this config (like Storybook's preview build)
// don't attempt to load an ESM-only package at module-evaluation time.
export default defineConfig(async ({ mode }) => {
  const plugins = [] as any[];
  try {
    const mod = await import('@vitejs/plugin-react');
    const reactPlugin = (mod && (mod.default ?? mod)) as any;
    if (reactPlugin) plugins.push(reactPlugin());
  } catch (e) {
    // If dynamic import fails (e.g., in Storybook's require-based loader),
    // continue without the plugin. Vite run directly will succeed because
    // dynamic import resolves in Node ESM contexts.
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'sharedReact',
        fileName: (format: string) => `shared-react.${format}.js`
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
      }
    }
  };
});
