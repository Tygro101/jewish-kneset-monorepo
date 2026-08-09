import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KeepAwakeGuard } from '../src/main/keep-awake';

const CHECK_MS = 60_000;

/** Fake powerSaveBlocker. `live` controls what isStarted() reports. */
function makeBlocker() {
  let nextId = 1;
  const state = { live: true };
  const blocker = {
    start: vi.fn(() => nextId++),
    stop: vi.fn(),
    isStarted: vi.fn(() => state.live),
  };
  return { blocker, state };
}

function makeGuard() {
  const { blocker, state } = makeBlocker();
  const logs: string[] = [];
  const guard = new KeepAwakeGuard({
    blocker,
    checkIntervalMs: CHECK_MS,
    logger: (m) => logs.push(m),
  });
  return { guard, blocker, state, logs };
}

describe('KeepAwakeGuard', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts a display-sleep blocker and returns its id', () => {
    const { guard, blocker } = makeGuard();
    const id = guard.start();
    expect(blocker.start).toHaveBeenCalledWith('prevent-display-sleep');
    expect(id).toBe(1);
    expect(guard.isActive()).toBe(true);
  });

  it('is idempotent — a second start() does not create a second blocker', () => {
    const { guard, blocker } = makeGuard();
    guard.start();
    guard.start();
    guard.start();
    expect(blocker.start).toHaveBeenCalledTimes(1);
  });

  it('re-arms from the watchdog when the OS drops the blocker', () => {
    const { guard, blocker, state } = makeGuard();
    guard.start();
    expect(blocker.start).toHaveBeenCalledTimes(1);

    // OS silently dropped it.
    state.live = false;
    vi.advanceTimersByTime(CHECK_MS);

    expect(blocker.start).toHaveBeenCalledTimes(2);
  });

  it('watchdog does nothing while the blocker is still live', () => {
    const { guard, blocker } = makeGuard();
    guard.start();
    vi.advanceTimersByTime(CHECK_MS * 10);
    expect(blocker.start).toHaveBeenCalledTimes(1);
  });

  it('reArm() stops the old blocker and starts a new one', () => {
    const { guard, blocker } = makeGuard();
    guard.start();
    guard.reArm();
    expect(blocker.stop).toHaveBeenCalledWith(1);
    expect(blocker.start).toHaveBeenCalledTimes(2);
  });

  it('stop() stops the blocker and disarms the watchdog', () => {
    const { guard, blocker, state } = makeGuard();
    guard.start();
    guard.stop();
    expect(blocker.stop).toHaveBeenCalledTimes(1);

    // Watchdog must be dead: even with the blocker "dropped", nothing restarts.
    state.live = false;
    vi.advanceTimersByTime(CHECK_MS * 5);
    expect(blocker.start).toHaveBeenCalledTimes(1);
  });

  it('survives a throwing start() without propagating', () => {
    const { blocker } = makeBlocker();
    blocker.start = vi.fn(() => {
      throw new Error('boom');
    });
    const guard = new KeepAwakeGuard({ blocker, checkIntervalMs: CHECK_MS, logger: () => {} });
    expect(() => guard.start()).not.toThrow();
    expect(guard.isActive()).toBe(false);
  });

  it('survives a throwing isStarted() and treats it as inactive', () => {
    const { blocker } = makeBlocker();
    blocker.isStarted = vi.fn(() => {
      throw new Error('boom');
    });
    const guard = new KeepAwakeGuard({ blocker, checkIntervalMs: CHECK_MS, logger: () => {} });
    guard.start();
    expect(guard.isActive()).toBe(false);
  });

  it('logs when it has to re-arm, so the field log shows the drop', () => {
    const { guard, state, logs } = makeGuard();
    guard.start();
    state.live = false;
    vi.advanceTimersByTime(CHECK_MS);
    expect(logs.some((m) => m.includes('NOT active'))).toBe(true);
  });
});
