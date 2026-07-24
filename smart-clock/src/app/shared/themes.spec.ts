/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyTheme, loadTheme, THEME_FAMILIES } from './themes';

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

describe('themes', () => {
    beforeEach(() => {
        mockStorage.clear();
        document.documentElement.removeAttribute('style');
    });

    it('exposes exactly the eleven expected families', () => {
        expect(THEME_FAMILIES.map((f) => f.id)).toEqual([
            'blue', 'purple', 'orange', 'red',
            'teal', 'cyan', 'green', 'pink', 'indigo', 'amber', 'slate',
        ]);
    });

    it('every family applies a non-empty accent color', () => {
        const root = document.documentElement;
        for (const fam of THEME_FAMILIES) {
            root.removeAttribute('style');
            applyTheme(fam.id, 'dark');
            expect(root.style.getPropertyValue('--accent-emerald')).not.toBe('');
        }
    });

    it('defaults to blue/dark when nothing is saved', () => {
        expect(loadTheme()).toEqual({ familyId: 'blue', mode: 'dark' });
    });

    it('applyTheme sets CSS variables on :root and persists the choice', () => {
        applyTheme('purple', 'light');
        const root = document.documentElement;
        expect(root.style.getPropertyValue('--accent-emerald')).toBe('#7c3aed');
        expect(root.style.getPropertyValue('--app-bg')).toBe('#faf5ff');
        expect(loadTheme()).toEqual({ familyId: 'purple', mode: 'light' });
    });

    it('falls back to blue for an unknown family id', () => {
        applyTheme('does-not-exist', 'dark');
        expect(document.documentElement.style.getPropertyValue('--accent-emerald')).toBe('#34d399');
    });
});
