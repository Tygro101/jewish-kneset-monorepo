/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// jsdom in this vitest config doesn't provide localStorage; mock it.
const store: Record<string, string> = {};
const mockStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};
Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true });

// Import AFTER localStorage mock is in place (settingsSlice reads it at module init).
import reducer, {
    setNetzCountdownEnabled,
    setNetzCountdownMinutes,
    loadSettings,
} from './settingsSlice';

describe('settingsSlice', () => {
    beforeEach(() => {
        mockStorage.clear();
    });

    it('defaults to disabled and 5 minutes', () => {
        const state = reducer(undefined, { type: '@@INIT' });
        expect(state.netzCountdownEnabled).toBe(false);
        expect(state.netzCountdownMinutes).toBe(5);
    });

    it('enables the countdown', () => {
        const state = reducer(undefined, setNetzCountdownEnabled(true));
        expect(state.netzCountdownEnabled).toBe(true);
    });

    it('disables the countdown', () => {
        let state = reducer(undefined, setNetzCountdownEnabled(true));
        state = reducer(state, setNetzCountdownEnabled(false));
        expect(state.netzCountdownEnabled).toBe(false);
    });

    it('sets an allowed minutes value', () => {
        const state = reducer(undefined, setNetzCountdownMinutes(10));
        expect(state.netzCountdownMinutes).toBe(10);
    });

    it('sets another allowed minutes value', () => {
        const state = reducer(undefined, setNetzCountdownMinutes(1));
        expect(state.netzCountdownMinutes).toBe(1);
    });

    it('ignores a minutes value not in the allowed list', () => {
        const state = reducer(undefined, setNetzCountdownMinutes(7));
        expect(state.netzCountdownMinutes).toBe(5); // unchanged default
    });

    it('persists enabled state to localStorage', () => {
        reducer(undefined, setNetzCountdownEnabled(true));
        expect(mockStorage.setItem).toHaveBeenCalled();
        const saved = JSON.parse(store['smartclock-settings']);
        expect(saved.netzCountdownEnabled).toBe(true);
    });

    it('persists minutes to localStorage', () => {
        reducer(undefined, setNetzCountdownMinutes(3));
        const saved = JSON.parse(store['smartclock-settings']);
        expect(saved.netzCountdownMinutes).toBe(3);
    });

    describe('loadSettings', () => {
        it('falls back to defaults on invalid JSON', () => {
            store['smartclock-settings'] = '{not valid';
            expect(loadSettings()).toEqual({ netzCountdownEnabled: false, netzCountdownMinutes: 5, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false });
        });

        it('falls back to defaults when key is missing', () => {
            expect(loadSettings()).toEqual({ netzCountdownEnabled: false, netzCountdownMinutes: 5, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false });
        });

        it('reads persisted values', () => {
            store['smartclock-settings'] = JSON.stringify({ netzCountdownEnabled: true, netzCountdownMinutes: 3 });
            expect(loadSettings()).toEqual({ netzCountdownEnabled: true, netzCountdownMinutes: 3, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false });
        });

        it('ignores invalid minutes in storage', () => {
            store['smartclock-settings'] = JSON.stringify({ netzCountdownEnabled: true, netzCountdownMinutes: 99 });
            expect(loadSettings()).toEqual({ netzCountdownEnabled: true, netzCountdownMinutes: 5, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false });
        });
    });
});
