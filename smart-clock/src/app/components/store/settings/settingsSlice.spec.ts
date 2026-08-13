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
    setScheduleDaysAhead,
    setZmanimCount,
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
            expect(loadSettings()).toEqual({ netzCountdownEnabled: false, netzCountdownMinutes: 5, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false, scheduleDaysAheadTv: 6, scheduleDaysAheadTablet: 2, zmanimCountTv: 6, zmanimCountTablet: 4 });
        });

        it('falls back to defaults when key is missing', () => {
            expect(loadSettings()).toEqual({ netzCountdownEnabled: false, netzCountdownMinutes: 5, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false, scheduleDaysAheadTv: 6, scheduleDaysAheadTablet: 2, zmanimCountTv: 6, zmanimCountTablet: 4 });
        });

        it('reads persisted values', () => {
            store['smartclock-settings'] = JSON.stringify({ netzCountdownEnabled: true, netzCountdownMinutes: 3 });
            expect(loadSettings()).toEqual({ netzCountdownEnabled: true, netzCountdownMinutes: 3, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false, scheduleDaysAheadTv: 6, scheduleDaysAheadTablet: 2, zmanimCountTv: 6, zmanimCountTablet: 4 });
        });

        it('ignores invalid minutes in storage', () => {
            store['smartclock-settings'] = JSON.stringify({ netzCountdownEnabled: true, netzCountdownMinutes: 99 });
            expect(loadSettings()).toEqual({ netzCountdownEnabled: true, netzCountdownMinutes: 5, presentationsBlocked: false, messagesBlocked: false, scheduleBlocked: false, scheduleDaysAheadTv: 6, scheduleDaysAheadTablet: 2, zmanimCountTv: 6, zmanimCountTablet: 4 });
        });
    });

    describe('scheduleDaysAhead', () => {
        it('defaults the device day counts to TV 6 / tablet 2', () => {
            const state = loadSettings();
            expect(state.scheduleDaysAheadTv).toBe(6);
            expect(state.scheduleDaysAheadTablet).toBe(2);
        });

        it('setScheduleDaysAhead stores and clamps per target', () => {
            let state = reducer(loadSettings(), setScheduleDaysAhead({ target: 'tv', days: 4 }));
            expect(state.scheduleDaysAheadTv).toBe(4);

            state = reducer(state, setScheduleDaysAhead({ target: 'tablet', days: 7 }));
            expect(state.scheduleDaysAheadTablet).toBe(3); // tablet cap

            state = reducer(state, setScheduleDaysAhead({ target: 'tablet', days: 0 }));
            expect(state.scheduleDaysAheadTablet).toBe(1); // floor
        });

        it('reads persisted day counts from localStorage', () => {
            store['smartclock-settings'] = JSON.stringify({
                netzCountdownEnabled: false,
                netzCountdownMinutes: 5,
                scheduleDaysAheadTv: 4,
                scheduleDaysAheadTablet: 1,
            });
            const state = loadSettings();
            expect(state.scheduleDaysAheadTv).toBe(4);
            expect(state.scheduleDaysAheadTablet).toBe(1);
        });

        it('clamps out-of-range persisted values', () => {
            store['smartclock-settings'] = JSON.stringify({
                scheduleDaysAheadTv: 99,
                scheduleDaysAheadTablet: 10,
            });
            const state = loadSettings();
            expect(state.scheduleDaysAheadTv).toBe(7);
            expect(state.scheduleDaysAheadTablet).toBe(3);
        });
    });

    describe('zmanimCount', () => {
        it('defaults the device card counts to TV 6 / tablet 4', () => {
            const state = loadSettings();
            expect(state.zmanimCountTv).toBe(6);
            expect(state.zmanimCountTablet).toBe(4);
        });

        it('setZmanimCount stores per target', () => {
            let state = reducer(loadSettings(), setZmanimCount({ target: 'tv', count: 4 }));
            expect(state.zmanimCountTv).toBe(4);
            expect(state.zmanimCountTablet).toBe(4); // untouched

            state = reducer(state, setZmanimCount({ target: 'tablet', count: 6 }));
            expect(state.zmanimCountTablet).toBe(6);
            expect(state.zmanimCountTv).toBe(4); // untouched
        });

        it('setZmanimCount falls back to the target default on a bad value', () => {
            const state = reducer(
                loadSettings(),
                // @ts-expect-error – guarding the runtime path against invalid input
                setZmanimCount({ target: 'tablet', count: 5 }),
            );
            expect(state.zmanimCountTablet).toBe(4);
        });

        it('persists card counts to localStorage', () => {
            reducer(loadSettings(), setZmanimCount({ target: 'tv', count: 4 }));
            const saved = JSON.parse(store['smartclock-settings']);
            expect(saved.zmanimCountTv).toBe(4);
        });

        it('reads persisted card counts and clamps invalid ones', () => {
            store['smartclock-settings'] = JSON.stringify({
                zmanimCountTv: 4,
                zmanimCountTablet: 99,
            });
            const state = loadSettings();
            expect(state.zmanimCountTv).toBe(4);
            expect(state.zmanimCountTablet).toBe(4); // default fallback
        });
    });
});
