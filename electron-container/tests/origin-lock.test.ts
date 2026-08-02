import { describe, expect, it } from 'vitest';
import { PRODUCTION_URL, TV_ROUTE, resolveTargetUrl } from '../src/main/config';
import { isAllowedNavigation } from '../src/main/origin-lock';

const OFFLINE = 'file:///C:/app/static/offline.html';
const opts = { allowedPrefixes: [PRODUCTION_URL], offlineFileUrl: OFFLINE };

describe('isAllowedNavigation', () => {
  it('allows the target url itself', () => {
    expect(isAllowedNavigation(PRODUCTION_URL, opts)).toBe(true);
  });

  it('allows sub-paths and query strings', () => {
    expect(isAllowedNavigation(`${PRODUCTION_URL}assets/app.js`, opts)).toBe(true);
    expect(isAllowedNavigation(`${PRODUCTION_URL}config.json?t=123`, opts)).toBe(true);
    expect(isAllowedNavigation(`${PRODUCTION_URL}#/settings`, opts)).toBe(true);
  });

  it('allows about:blank', () => {
    expect(isAllowedNavigation('about:blank', opts)).toBe(true);
  });

  it('allows the bundled offline page, ignoring the fragment', () => {
    expect(isAllowedNavigation(OFFLINE, opts)).toBe(true);
    expect(isAllowedNavigation(`${OFFLINE}#retry`, opts)).toBe(true);
  });

  it('denies other paths on the same host', () => {
    expect(isAllowedNavigation('https://tygro101.github.io/other-project/', opts)).toBe(false);
  });

  it('denies look-alike hosts', () => {
    expect(
      isAllowedNavigation('https://tygro101.github.io.evil.com/jewish-kneset-monorepo/', opts),
    ).toBe(false);
  });

  it('denies unrelated sites and non-web schemes', () => {
    expect(isAllowedNavigation('https://example.com/', opts)).toBe(false);
    expect(isAllowedNavigation('file:///C:/Windows/System32/notepad.exe', opts)).toBe(false);
    expect(isAllowedNavigation('javascript:alert(1)', opts)).toBe(false);
    expect(isAllowedNavigation('', opts)).toBe(false);
    expect(isAllowedNavigation('not a url', opts)).toBe(false);
  });

  it('allows the dev server only when it is in the prefix list', () => {
    expect(isAllowedNavigation('http://localhost:3001/', opts)).toBe(false);
    expect(
      isAllowedNavigation('http://localhost:3001/', {
        allowedPrefixes: [PRODUCTION_URL, 'http://localhost:3001/'],
      }),
    ).toBe(true);
  });

  it('allows the TV hash route', () => {
    expect(isAllowedNavigation(`${PRODUCTION_URL}${TV_ROUTE}`, opts)).toBe(true);
    expect(isAllowedNavigation(resolveTargetUrl(true), opts)).toBe(true);
  });
});
