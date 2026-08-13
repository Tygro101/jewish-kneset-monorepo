import type { ZmanimCount } from '@shared/core/display/zmanim-count';

/** Allowed values for the netz countdown window (minutes), shown in the dropdown. */
export const NETZ_COUNTDOWN_MINUTE_OPTIONS = [1, 2, 3, 4, 5, 10] as const;

export interface SettingsState {
    /** When true, the clock switches to a countdown as netz approaches. */
    netzCountdownEnabled: boolean;
    /** How many minutes before netz the countdown begins. */
    netzCountdownMinutes: number;
    /** When true, presentation slides (images/PDFs) are not shown in the rotation. */
    presentationsBlocked: boolean;
    /** When true, text messages (donor recognition, announcements) are not shown in the rotation. */
    messagesBlocked: boolean;
    /** When true, the schedule calendar view is not shown in the tablet rotation. */
    scheduleBlocked: boolean;
    /** On-screen (device-local) day count for the TV layout. Used when the CMS says "screen". */
    scheduleDaysAheadTv: number;
    /** On-screen (device-local) day count for the tablet layout. Used when the CMS says "screen". */
    scheduleDaysAheadTablet: number;
    /** On-screen (device-local) zmanim card count for the TV layout. */
    zmanimCountTv: ZmanimCount;
    /** On-screen (device-local) zmanim card count for the tablet layout. */
    zmanimCountTablet: ZmanimCount;
}
