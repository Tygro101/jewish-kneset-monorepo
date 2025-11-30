# shared-react

Small shared React component package for monorepo development.

Usage:

- From a project in the monorepo, configure Vite alias `@shared` to point to `../shared-react/src` and allow fs access to the folder.
- Import components: `import { Button } from '@shared';`

Vite example (in `vite.config.ts` of a consuming project):

```ts
import { resolve } from 'path';
const shardFolderDir = resolve(__dirname, '..', 'shared-react', 'src');
// then set resolve.alias['@shared'] = shardFolderDir and server.fs.allow to include it
```
 
Storybook
--------

Run Storybook for local component development:

```powershell
cd shared-react
npm install
npm run storybook
```

This starts Storybook on port `6006`. If `npm install` fails due to registry or network issues, try your usual package manager or workspace setup (pnpm/yarn).

Build:

```
npm install
npm run build
```
