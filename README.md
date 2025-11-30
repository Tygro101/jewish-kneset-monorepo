# jewish-kneset-monorepo

Usage note: to consume the local `shared-react` package from Vite projects in this monorepo, set an alias to the package `src` folder and allow filesystem access. Example (in `vite.config.ts` of a project):

```ts
import { resolve } from 'path';
const shardFolderDir = resolve(__dirname, '..', 'shared-react', 'src');
resolve: { alias: { '@shared': shardFolderDir } },
server: { fs: { allow: [shardFolderDir] } }
```

Then import components with `import { Button } from '@shared';`.

