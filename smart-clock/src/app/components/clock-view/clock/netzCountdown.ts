export interface NetzCountdownResult {
    /** True only when netz is upcoming AND within the configured window. */
    active: boolean;
    /** Milliseconds remaining until netz (0 when not active). */
    remainingMs: number;
}

/**
 * Decides whether the countdown should be shown right now.
 *
 * Active only when: 0 <= (netz - now) <= windowMinutes.
 *  - If netz already passed (netz - now < 0) -> inactive (revert to clock).
 *  - If netz is further away than the window -> inactive (normal clock).
 *
 * @param netzDate ISO date string for netz, or null/undefined when unavailable.
 * @param now      current time.
 * @param windowMinutes how many minutes before netz to start the countdown.
 */
export function getNetzCountdown(
    netzDate: string | null | undefined,
    now: Date,
    windowMinutes: number,
): NetzCountdownResult {
    if (!netzDate) return { active: false, remainingMs: 0 };

    const netzMs = new Date(netzDate).getTime();
    if (Number.isNaN(netzMs)) return { active: false, remainingMs: 0 };

    const remainingMs = netzMs - now.getTime();
    const windowMs = windowMinutes * 60 * 1000;

    const active = remainingMs >= 0 && remainingMs <= windowMs;
    return { active, remainingMs: active ? remainingMs : 0 };
}

/** Formats remaining milliseconds as MM:SS (e.g. 272000 -> "04:32"). */
export function formatCountdown(remainingMs: number): string {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}`;
}
