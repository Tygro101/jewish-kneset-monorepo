import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectivityMonitor } from '../src/main/connectivity';

const DEBOUNCE = 3_000;

function makeMonitor(probe = vi.fn(async () => true)) {
  const onReconnect = vi.fn();
  const monitor = new ConnectivityMonitor({
    probe,
    onReconnect,
    pollIntervalMs: 30_000,
    debounceMs: DEBOUNCE,
  });
  return { monitor, onReconnect, probe };
}

describe('ConnectivityMonitor', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does nothing while online', () => {
    const { monitor, onReconnect } = makeMonitor();
    monitor.handleState(true);
    monitor.handleState(true);
    vi.advanceTimersByTime(60_000);
    expect(onReconnect).not.toHaveBeenCalled();
  });

  it('fires once after the debounce on an offline -> online edge', () => {
    const { monitor, onReconnect } = makeMonitor();
    monitor.handleState(false);
    monitor.handleState(true);
    expect(onReconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(DEBOUNCE);
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('does not fire again while staying online', () => {
    const { monitor, onReconnect } = makeMonitor();
    monitor.handleState(false);
    monitor.handleState(true);
    vi.advanceTimersByTime(DEBOUNCE);
    monitor.handleState(true);
    monitor.handleState(true);
    vi.advanceTimersByTime(60_000);
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending reload if the link drops during the debounce', () => {
    const { monitor, onReconnect } = makeMonitor();
    monitor.handleState(false);
    monitor.handleState(true);
    vi.advanceTimersByTime(DEBOUNCE - 500);
    monitor.handleState(false);
    vi.advanceTimersByTime(60_000);
    expect(onReconnect).not.toHaveBeenCalled();
  });

  it('coalesces a flapping connection into one reload', () => {
    const { monitor, onReconnect } = makeMonitor();
    for (let i = 0; i < 5; i += 1) {
      monitor.handleState(false);
      monitor.handleState(true);
      vi.advanceTimersByTime(100);
    }
    vi.advanceTimersByTime(DEBOUNCE);
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('treats a throwing probe as offline', async () => {
    const probe = vi.fn(async () => {
      throw new Error('boom');
    });
    const { monitor, onReconnect } = makeMonitor(probe);
    await monitor.poll();
    monitor.handleState(true);
    vi.advanceTimersByTime(DEBOUNCE);
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('stop() cancels everything', () => {
    const { monitor, onReconnect } = makeMonitor();
    monitor.handleState(false);
    monitor.handleState(true);
    monitor.stop();
    vi.advanceTimersByTime(60_000);
    expect(onReconnect).not.toHaveBeenCalled();
  });
});
