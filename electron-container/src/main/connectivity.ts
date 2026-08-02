/**
 * Port of react-container/hooks/useConnectivityReload.ts.
 *
 * Fires `onReconnect` once per offline -> online transition, after a debounce,
 * so the smart-clock service worker re-checks for a new build.
 *
 * The network probe is injected, so this class is unit-tested with no Electron.
 */

export interface ConnectivityMonitorOptions {
  /** Resolves true when the host is reachable. Must never throw. */
  probe: () => Promise<boolean>;
  onReconnect: () => void;
  pollIntervalMs: number;
  debounceMs: number;
  logger?: (message: string) => void;
}

export class ConnectivityMonitor {
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private wasOffline = false;
  private probeInFlight = false;

  constructor(private readonly options: ConnectivityMonitorOptions) {}

  start(): void {
    if (this.pollTimer) return;
    void this.poll();
    this.pollTimer = setInterval(() => void this.poll(), this.options.pollIntervalMs);
  }

  stop(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
    this.cancelPendingReconnect();
  }

  /** Runs one probe. Overlapping probes are skipped. */
  async poll(): Promise<void> {
    if (this.probeInFlight) return;
    this.probeInFlight = true;
    let online = false;
    try {
      online = await this.options.probe();
    } catch {
      online = false;
    } finally {
      this.probeInFlight = false;
    }
    this.handleState(online);
  }

  /** Public test seam: drive the state machine directly. */
  handleState(isOnline: boolean): void {
    if (!isOnline) {
      this.wasOffline = true;
      this.cancelPendingReconnect();
      return;
    }
    if (!this.wasOffline) return;

    this.wasOffline = false;
    this.cancelPendingReconnect();
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.options.logger?.('[Connectivity] Network restored — reloading to check for updates.');
      this.options.onReconnect();
    }, this.options.debounceMs);
  }

  private cancelPendingReconnect(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
  }
}
