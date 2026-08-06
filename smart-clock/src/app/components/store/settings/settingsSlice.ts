import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateKeys } from '../../../store.models';
import { NETZ_COUNTDOWN_MINUTE_OPTIONS, SettingsState } from './settingsState';
import { clampDaysAhead } from '@shared/core/schedule/timeline-builder';
import { DAYS_AHEAD_LIMITS, type DaysAheadTarget } from '@shared/core/schedule/days-ahead';

const STORAGE_KEY = 'smartclock-settings';

const DEFAULTS: SettingsState = {
    netzCountdownEnabled: false,
    netzCountdownMinutes: 5,
    presentationsBlocked: false,
    messagesBlocked: false,
    scheduleBlocked: false,
    scheduleDaysAheadTv: DAYS_AHEAD_LIMITS.tv.default,
    scheduleDaysAheadTablet: DAYS_AHEAD_LIMITS.tablet.default,
};

/** Loads settings from localStorage, falling back to DEFAULTS on any problem. */
export function loadSettings(): SettingsState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULTS };
        const parsed = JSON.parse(raw);
        const enabled =
            typeof parsed.netzCountdownEnabled === 'boolean'
                ? parsed.netzCountdownEnabled
                : DEFAULTS.netzCountdownEnabled;
        // Only accept a value that is in our allowed list; otherwise use the default.
        const minutes = (NETZ_COUNTDOWN_MINUTE_OPTIONS as readonly number[]).includes(
            parsed.netzCountdownMinutes,
        )
            ? parsed.netzCountdownMinutes
            : DEFAULTS.netzCountdownMinutes;
        const presentationsBlocked =
            typeof parsed.presentationsBlocked === 'boolean'
                ? parsed.presentationsBlocked
                : DEFAULTS.presentationsBlocked;
        const messagesBlocked =
            typeof parsed.messagesBlocked === 'boolean'
                ? parsed.messagesBlocked
                : DEFAULTS.messagesBlocked;
        const scheduleBlocked =
            typeof parsed.scheduleBlocked === 'boolean'
                ? parsed.scheduleBlocked
                : DEFAULTS.scheduleBlocked;
        const scheduleDaysAheadTv = clampDaysAhead(
            parsed.scheduleDaysAheadTv,
            DEFAULTS.scheduleDaysAheadTv,
            DAYS_AHEAD_LIMITS.tv.max,
        );
        const scheduleDaysAheadTablet = clampDaysAhead(
            parsed.scheduleDaysAheadTablet,
            DEFAULTS.scheduleDaysAheadTablet,
            DAYS_AHEAD_LIMITS.tablet.max,
        );
        return {
            netzCountdownEnabled: enabled,
            netzCountdownMinutes: minutes,
            presentationsBlocked,
            messagesBlocked,
            scheduleBlocked,
            scheduleDaysAheadTv,
            scheduleDaysAheadTablet,
        };
    } catch {
        return { ...DEFAULTS };
    }
}

/** Writes the current settings to localStorage (ignores storage errors). */
function persist(state: SettingsState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* ignore (private mode, etc.) */
    }
}

const initialState: SettingsState = loadSettings();

export const settingsSlice = createSlice({
    name: StateKeys.Settings,
    initialState,
    reducers: {
        setNetzCountdownEnabled: (state, action: PayloadAction<boolean>) => {
            state.netzCountdownEnabled = action.payload;
            persist(state);
        },
        setNetzCountdownMinutes: (state, action: PayloadAction<number>) => {
            // Guard: ignore values that are not in the allowed list.
            if ((NETZ_COUNTDOWN_MINUTE_OPTIONS as readonly number[]).includes(action.payload)) {
                state.netzCountdownMinutes = action.payload;
                persist(state);
            }
        },
        setPresentationsBlocked: (state, action: PayloadAction<boolean>) => {
            state.presentationsBlocked = action.payload;
            persist(state);
        },
        setMessagesBlocked: (state, action: PayloadAction<boolean>) => {
            state.messagesBlocked = action.payload;
            persist(state);
        },
        setScheduleBlocked: (state, action: PayloadAction<boolean>) => {
            state.scheduleBlocked = action.payload;
            persist(state);
        },
        setScheduleDaysAhead: (
            state,
            action: PayloadAction<{ target: DaysAheadTarget; days: number }>,
        ) => {
            const { target, days } = action.payload;
            const limits = DAYS_AHEAD_LIMITS[target];
            const value = clampDaysAhead(days, limits.default, limits.max);
            if (target === 'tv') state.scheduleDaysAheadTv = value;
            else state.scheduleDaysAheadTablet = value;
            persist(state);
        },
    },
});

export const { setNetzCountdownEnabled, setNetzCountdownMinutes, setPresentationsBlocked, setMessagesBlocked, setScheduleBlocked, setScheduleDaysAhead } = settingsSlice.actions;
export default settingsSlice.reducer;
