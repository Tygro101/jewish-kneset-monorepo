import { describe, expect, it } from 'vitest';
import { nextRetryDelay, shouldRetryLoadFailure } from '../src/main/load-retry';

describe('nextRetryDelay', () => {
  it('escalates 5s, 10s, 30s, 60s', () => {
    expect(nextRetryDelay(1)).toBe(5_000);
    expect(nextRetryDelay(2)).toBe(10_000);
    expect(nextRetryDelay(3)).toBe(30_000);
    expect(nextRetryDelay(4)).toBe(60_000);
  });

  it('caps at 60s', () => {
    expect(nextRetryDelay(5)).toBe(60_000);
    expect(nextRetryDelay(500)).toBe(60_000);
  });

  it('is defensive about bad input', () => {
    expect(nextRetryDelay(0)).toBe(5_000);
    expect(nextRetryDelay(-1)).toBe(5_000);
    expect(nextRetryDelay(Number.NaN)).toBe(5_000);
  });
});

describe('shouldRetryLoadFailure', () => {
  it('retries real main-frame failures', () => {
    expect(shouldRetryLoadFailure(-106 /* ERR_INTERNET_DISCONNECTED */, true)).toBe(true);
    expect(shouldRetryLoadFailure(-105 /* ERR_NAME_NOT_RESOLVED */, true)).toBe(true);
  });

  it('ignores sub-resource failures', () => {
    expect(shouldRetryLoadFailure(-106, false)).toBe(false);
  });

  it('ignores aborts', () => {
    expect(shouldRetryLoadFailure(-3, true)).toBe(false);
    expect(shouldRetryLoadFailure(0, true)).toBe(false);
  });
});
