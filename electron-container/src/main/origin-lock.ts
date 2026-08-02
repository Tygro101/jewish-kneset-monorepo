/**
 * Navigation guard. Port of react-container's onShouldStartLoadWithRequest,
 * tightened to compare origin AND path prefix.
 *
 * No 'electron' import — unit-tested in plain Node.
 */

export interface OriginLockOptions {
  /** Full URL prefixes that are allowed, e.g. 'https://host/jewish-kneset-monorepo/'. */
  allowedPrefixes: string[];
  /** file:// URL of the bundled offline fallback page, if any. */
  offlineFileUrl?: string | null;
}

function stripFragment(url: string): string {
  const hashIndex = url.indexOf('#');
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
}

export function isAllowedNavigation(rawUrl: string, options: OriginLockOptions): boolean {
  if (!rawUrl) return false;

  // Service workers and some internal loads use about:blank.
  if (rawUrl === 'about:blank') return true;

  // Our own bundled fallback page.
  if (options.offlineFileUrl && stripFragment(rawUrl) === stripFragment(options.offlineFileUrl)) {
    return true;
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return false;
  }

  if (target.protocol !== 'https:' && target.protocol !== 'http:') return false;

  return options.allowedPrefixes.some((prefix) => {
    let base: URL;
    try {
      base = new URL(prefix);
    } catch {
      return false;
    }
    // Exact origin match defeats look-alike hosts such as host.evil.com.
    if (base.origin !== target.origin) return false;
    return target.pathname.startsWith(base.pathname);
  });
}
