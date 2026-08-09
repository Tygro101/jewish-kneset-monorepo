import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const ROOT_ELEMENT_ID = 'root';

interface RootRegistry {
  root?: Root;
}

/**
 * Holds the single React root for this page.
 *
 * Stored in `import.meta.hot.data` so that a Vite HMR update which re-executes
 * this module reuses the existing root instead of calling createRoot() again.
 * Two roots on one container corrupt React's view of the DOM and produce
 * "Failed to execute 'removeChild' on 'Node'" during commit.
 */
const registry: RootRegistry = import.meta.hot?.data?.rootRegistry ?? {};
if (import.meta.hot) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (import.meta.hot as any).data ??= {};
  import.meta.hot.data.rootRegistry = registry;
}

/** Returns the existing root for `container`, creating it only on first call. */
export function getOrCreateRoot(container: HTMLElement): Root {
  if (!registry.root) {
    registry.root = createRoot(container);
  }
  return registry.root;
}

/** Mounts (or re-renders) the app into #root. Safe to call more than once. */
export function mountAppRoot(node: ReactNode): Root {
  const container = document.getElementById(ROOT_ELEMENT_ID);
  if (!container) {
    throw new Error(`mountAppRoot: #${ROOT_ELEMENT_ID} not found in document`);
  }
  const root = getOrCreateRoot(container);
  root.render(node);
  return root;
}

/** Test seam — forgets the cached root so each test starts clean. */
export function resetRootRegistryForTests(): void {
  delete registry.root;
}
