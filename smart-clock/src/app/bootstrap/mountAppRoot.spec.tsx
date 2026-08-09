/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getOrCreateRoot, mountAppRoot, resetRootRegistryForTests } from './mountAppRoot';

describe('mountAppRoot', () => {
  beforeEach(() => {
    resetRootRegistryForTests();
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    resetRootRegistryForTests();
    document.body.innerHTML = '';
  });

  it('returns the same root instance when called twice on the same container', () => {
    const container = document.getElementById('root')!;
    const first = getOrCreateRoot(container);
    const second = getOrCreateRoot(container);
    expect(second).toBe(first);
  });

  it('renders into #root', async () => {
    mountAppRoot(<p>hello</p>);
    // React 19 renders asynchronously in some environments; flush microtasks
    await new Promise((r) => setTimeout(r, 0));
    expect(document.getElementById('root')!.textContent).toBe('hello');
  });

  it('re-rendering does not create a second root and updates content', async () => {
    const first = mountAppRoot(<p>one</p>);
    const second = mountAppRoot(<p>two</p>);
    expect(second).toBe(first);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.getElementById('root')!.textContent).toBe('two');
  });

  it('throws a clear error when #root is missing', () => {
    document.body.innerHTML = '';
    expect(() => mountAppRoot(<p>x</p>)).toThrow(/#root not found/);
  });
});
