/**
 * Keeps the TV/monitor awake, and keeps *verifying* that it is still awake.
 *
 * Electron's `powerSaveBlocker` is fire-and-forget: if the OS drops the request
 * (resume from sleep, session switch, display topology change) nothing re-arms it.
 * This guard owns a watchdog that re-starts the blocker as soon as it observes
 * that the blocker is no longer active.
 *
 * The blocker is injected, so this class is unit-tested with no Electron.
 */

/** How often the watchdog re-checks that the blocker is still live. */
export const KEEP_AWAKE_CHECK_MS = 60_000;

export type PowerSaveBlockerType = 'prevent-app-suspension' | 'prevent-display-sleep';

/** The slice of Electron's `powerSaveBlocker` that this guard needs. */
export interface PowerSaveBlockerLike {
  start(type: PowerSaveBlockerType): number;
  stop(id: number): void;
  isStarted(id: number): boolean;
}

export interface KeepAwakeGuardOptions {
  blocker: PowerSaveBlockerLike;
  /** Watchdog period. Defaults to KEEP_AWAKE_CHECK_MS. */
  checkIntervalMs?: number;
  logger?: (message: string) => void;
}

export class KeepAwakeGuard {
  private blockerId: number | null = null;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  private readonly checkIntervalMs: number;

  constructor(private readonly options: KeepAwakeGuardOptions) {
    this.checkIntervalMs = options.checkIntervalMs ?? KEEP_AWAKE_CHECK_MS;
  }

  /** Starts the blocker (idempotent) and arms the watchdog. */
  start(): number | null {
    if (!this.isActive()) {
      this.blockerId = this.startBlocker();
    }
    this.armWatchdog();
    return this.blockerId;
  }

  /** Forces a fresh blocker. Call after OS power events. */
  reArm(): number | null {
    this.stopBlocker();
    this.blockerId = this.startBlocker();
    this.armWatchdog();
    return this.blockerId;
  }

  /** Stops the blocker and disarms the watchdog. */
  stop(): void {
    this.disarmWatchdog();
    this.stopBlocker();
  }

  /** True when we hold a live blocker. Never throws. */
  isActive(): boolean {
    if (this.blockerId === null) return false;
    try {
      return this.options.blocker.isStarted(this.blockerId);
    } catch (error) {
      this.log(`[KeepAwake] isStarted() threw: ${String(error)}`);
      return false;
    }
  }

  /** One watchdog tick. Public so the unit test can drive it directly. */
  check(): void {
    if (this.isActive()) return;
    const previous = this.blockerId;
    this.blockerId = this.startBlocker();
    this.log(
      `[KeepAwake] Blocker was NOT active (was id=${String(previous)}) — re-armed as id=${String(this.blockerId)}.`,
    );
  }

  private startBlocker(): number | null {
    try {
      const id = this.options.blocker.start('prevent-display-sleep');
      this.log(`[KeepAwake] powerSaveBlocker started, id = ${id}`);
      return id;
    } catch (error) {
      this.log(`[KeepAwake] start() failed: ${String(error)}`);
      return null;
    }
  }

  private stopBlocker(): void {
    if (this.blockerId === null) return;
    const id = this.blockerId;
    this.blockerId = null;
    try {
      if (this.options.blocker.isStarted(id)) {
        this.options.blocker.stop(id);
        this.log(`[KeepAwake] powerSaveBlocker stopped, id = ${id}`);
      }
    } catch (error) {
      this.log(`[KeepAwake] stop() failed: ${String(error)}`);
    }
  }

  private armWatchdog(): void {
    if (this.watchdog) return;
    this.watchdog = setInterval(() => this.check(), this.checkIntervalMs);
  }

  private disarmWatchdog(): void {
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = null;
  }

  private log(message: string): void {
    (this.options.logger ?? console.log)(message);
  }
}
