import { describe, expect, it } from 'vitest';
import {
  DEV_URL,
  PRODUCTION_URL,
  TV_ROUTE,
  USER_AGENT_SUFFIX,
  allowedPrefixes,
  buildUserAgent,
  resolveBaseUrl,
  resolveTargetUrl,
} from '../src/main/config';

describe('resolveBaseUrl', () => {
  it('returns production URL when packaged', () => {
    expect(resolveBaseUrl(true)).toBe(PRODUCTION_URL);
  });

  it('returns dev URL when not packaged', () => {
    expect(resolveBaseUrl(false)).toBe(DEV_URL);
  });

  it('never contains a fragment', () => {
    expect(resolveBaseUrl(true)).not.toContain('#');
    expect(resolveBaseUrl(false)).not.toContain('#');
  });
});

describe('resolveTargetUrl', () => {
  it('loads the TV route when packaged', () => {
    expect(resolveTargetUrl(true)).toBe(`${PRODUCTION_URL}${TV_ROUTE}`);
  });

  it('loads the TV route on the dev server when not packaged', () => {
    expect(resolveTargetUrl(false)).toBe(`${DEV_URL}${TV_ROUTE}`);
  });

  it('uses the smart-clock vite port in dev', () => {
    expect(resolveTargetUrl(false)).toContain(':3001');
  });

  it('uses https in production', () => {
    expect(resolveTargetUrl(true).startsWith('https://')).toBe(true);
  });

  it('starts with the base URL (passes origin lock)', () => {
    expect(resolveTargetUrl(true).startsWith(PRODUCTION_URL)).toBe(true);
    expect(resolveTargetUrl(false).startsWith(DEV_URL)).toBe(true);
  });
});

describe('TV_ROUTE', () => {
  it('is a hash route', () => {
    expect(TV_ROUTE.startsWith('#')).toBe(true);
  });
});

describe('allowedPrefixes', () => {
  it('allows only production when packaged', () => {
    expect(allowedPrefixes(true)).toEqual([PRODUCTION_URL]);
  });

  it('allows production and dev when unpackaged', () => {
    expect(allowedPrefixes(false)).toEqual([PRODUCTION_URL, DEV_URL]);
  });

  it('never contains fragments', () => {
    allowedPrefixes(true).forEach((p) => expect(p).not.toContain('#'));
    allowedPrefixes(false).forEach((p) => expect(p).not.toContain('#'));
  });
});

describe('buildUserAgent', () => {
  it('appends the suffix', () => {
    expect(buildUserAgent('Mozilla/5.0 Chrome/1.0')).toBe(
      `Mozilla/5.0 Chrome/1.0 ${USER_AGENT_SUFFIX}`,
    );
  });

  it('does not double-append', () => {
    const once = buildUserAgent('Mozilla/5.0');
    expect(buildUserAgent(once)).toBe(once);
  });

  it('handles an empty base', () => {
    expect(buildUserAgent('')).toBe(USER_AGENT_SUFFIX);
    expect(buildUserAgent('   ')).toBe(USER_AGENT_SUFFIX);
  });
});
