# jewish-kneset-monorepo

Usage note: to consume the local `shared-react` package from Vite projects in this monorepo, set an alias to the package `src` folder and allow filesystem access. Example (in `vite.config.ts` of a project):

```ts
import { resolve } from 'path';
const shardFolderDir = resolve(__dirname, '..', 'shared-react', 'src');
resolve: { alias: { '@shared': shardFolderDir } },
server: { fs: { allow: [shardFolderDir] } }
```

Then import components with `import { Button } from '@shared';`.

## Display containers

The smart-clock PWA is wrapped by two thin containers, both loading the deployed
GitHub Pages build and relying on its service worker for offline support:

- `react-container` — Android tablets (Expo + react-native-webview)
- `electron-container` — Windows PCs driving TVs (Electron, NSIS installer with
  auto-launch at boot). Loads the `#/tv` landscape route by default.
  See `electron-container/README.md`.

