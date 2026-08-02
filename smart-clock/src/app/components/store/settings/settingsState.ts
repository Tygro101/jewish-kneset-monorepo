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
}
