import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pruneMediaCache } from './mediaCache';
import type { Presentation } from './configState';

const BASE = 'https://jewish-kneset.github.io/test-tenant/';

interface MockCache {
  keys: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

/** Builds a `caches` mock whose keys() returns Request-like objects for the given URLs. */
function mockCaches(cachedUrls: string[]) {
  const cache: MockCache = {
    keys: vi.fn(async () => cachedUrls.map((url) => ({ url }))),
    delete: vi.fn(async () => true),
  };
  const open = vi.fn(async () => cache);
  vi.stubGlobal('caches', { open });
  return { cache, open };
}

function pres(file: string, title = file): Presentation {
  return { title, file, type: file.endsWith('.pdf') ? 'pdf' : 'image' };
}

/** URLs the mocked cache.delete was called with. */
function deletedUrls(cache: MockCache): string[] {
  return cache.delete.mock.calls.map((c) => (c[0] as { url: string }).url);
}

describe('pruneMediaCache', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('when caches is undefined', () => {
    beforeEach(() => {
      vi.stubGlobal('caches', undefined);
    });

    it('is a no-op and does not throw', async () => {
      await expect(
        pruneMediaCache('test-tenant', [pres('presentations/a.pdf')]),
      ).resolves.toBeUndefined();
    });
  });

  it('opens the tenant-presentations cache', async () => {
    const { open } = mockCaches([]);
    await pruneMediaCache('test-tenant', []);
    expect(open).toHaveBeenCalledWith('tenant-presentations');
  });

  it('deletes entries that are not in the active presentations list', async () => {
    const { cache } = mockCaches([
      `${BASE}presentations/keep.pdf`,
      `${BASE}presentations/removed.jpg`,
    ]);

    await pruneMediaCache('test-tenant', [pres('presentations/keep.pdf')]);

    expect(deletedUrls(cache)).toEqual([`${BASE}presentations/removed.jpg`]);
  });

  it('keeps entries that are still in the active presentations list', async () => {
    const { cache } = mockCaches([
      `${BASE}presentations/keep.pdf`,
      `${BASE}presentations/also-keep.png`,
    ]);

    await pruneMediaCache('test-tenant', [
      pres('presentations/keep.pdf'),
      pres('presentations/also-keep.png'),
    ]);

    expect(cache.delete).not.toHaveBeenCalled();
  });

  it('ignores query strings when matching (compares pathname only)', async () => {
    const { cache } = mockCaches([`${BASE}presentations/keep.pdf?v=123`]);

    await pruneMediaCache('test-tenant', [pres('presentations/keep.pdf')]);

    expect(cache.delete).not.toHaveBeenCalled();
  });

  it('matches config paths written with a leading slash', async () => {
    const { cache } = mockCaches([`${BASE}presentations/keep.pdf`]);

    await pruneMediaCache('test-tenant', [pres('/presentations/keep.pdf')]);

    expect(cache.delete).not.toHaveBeenCalled();
  });

  it('deletes everything when the active list is empty', async () => {
    const { cache } = mockCaches([
      `${BASE}presentations/a.pdf`,
      `${BASE}presentations/b.jpg`,
    ]);

    await pruneMediaCache('test-tenant', []);

    expect(deletedUrls(cache)).toEqual([
      `${BASE}presentations/a.pdf`,
      `${BASE}presentations/b.jpg`,
    ]);
  });

  it('does not protect entries whose config path fails sanitization', async () => {
    const { cache } = mockCaches([`${BASE}evil.pdf`]);

    // '../evil.pdf' is rejected by sanitizePresentationPath → never allowed
    await pruneMediaCache('test-tenant', [pres('../evil.pdf')]);

    expect(deletedUrls(cache)).toEqual([`${BASE}evil.pdf`]);
  });

  it('does not keep media belonging to a different tenant', async () => {
    const { cache } = mockCaches([
      'https://jewish-kneset.github.io/other-tenant/presentations/keep.pdf',
    ]);

    await pruneMediaCache('test-tenant', [pres('presentations/keep.pdf')]);

    expect(deletedUrls(cache)).toEqual([
      'https://jewish-kneset.github.io/other-tenant/presentations/keep.pdf',
    ]);
  });

  it('swallows Cache API errors', async () => {
    vi.stubGlobal('caches', {
      open: vi.fn(async () => { throw new Error('quota exceeded'); }),
    });

    await expect(pruneMediaCache('test-tenant', [])).resolves.toBeUndefined();
  });
});
