import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateKeys } from '../../../store.models';
import { NETZ_COUNTDOWN_MINUTE_OPTIONS, SettingsState } from './settingsState';

const STORAGE_KEY = 'smartclock-settings';

const DEFAULTS: SettingsState = {
    netzCountdownEnabled: false,
    netzCountdownMinutes: 5,
    presentationsBlocked: false,
    messagesBlocked: false,
    scheduleBlocked: false,
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
        return { netzCountdownEnabled: enabled, netzCountdownMinutes: minutes, presentationsBlocked, messagesBlocked, scheduleBlocked };
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
    },
});

export const { setNetzCountdownEnabled, setNetzCountdownMinutes, setPresentationsBlocked, setMessagesBlocked, setScheduleBlocked } = settingsSlice.actions;
export default settingsSlice.reducer;
