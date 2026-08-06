/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SettingsMenu } from './SettingsMenu';
import timeReducer from '../store/times/timesSlice';
import titlesReducer from '../store/titles/titlesSlice';
import configReducer from '../store/config/configSlice';
import settingsReducer from '../store/settings/settingsSlice';
import { StateKeys } from '../../store.models';

// ResizeObserver stub
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// localStorage mock
const storage: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
    clear: vi.fn(() => { Object.keys(storage).forEach((k) => delete storage[k]); }),
    get length() { return Object.keys(storage).length; },
    key: vi.fn((i: number) => Object.keys(storage)[i] ?? null),
  },
  writable: true,
});

function createStore() {
  return configureStore({
    reducer: {
      [StateKeys.Times]: timeReducer,
      [StateKeys.Titles]: titlesReducer,
      [StateKeys.Config]: configReducer,
      [StateKeys.Settings]: settingsReducer,
    },
  });
}

function renderMenu() {
  const store = createStore();
  return render(
    <Provider store={store}>
      <SettingsMenu />
    </Provider>,
  );
}

describe('SettingsMenu — gear reveal', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((k) => delete storage[k]);
    window.location.hash = '';
  });

  it('gear is hidden by default (tablet route)', () => {
    renderMenu();
    const gear = screen.getByLabelText('הגדרות');
    expect(gear.getAttribute('aria-hidden')).toBe('true');
    expect(gear.tabIndex).toBe(-1);
  });

  it('gear is hidden by default (tv route)', () => {
    window.location.hash = '#/tv';
    renderMenu();
    const gear = screen.getByLabelText('הגדרות');
    expect(gear.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the invisible hotspot', () => {
    renderMenu();
    expect(screen.getByTestId('settings-hotspot')).toBeTruthy();
  });

  describe('tablet route (trigger = tap)', () => {
    beforeEach(() => {
      window.location.hash = '';
    });

    it('pointerDown on hotspot reveals the gear', () => {
      renderMenu();
      const hotspot = screen.getByTestId('settings-hotspot');
      fireEvent.pointerDown(hotspot);
      const gear = screen.getByLabelText('הגדרות');
      expect(gear.getAttribute('aria-hidden')).toBe('false');
    });

    it('mouseEnter on hotspot does NOT reveal the gear on tablet', () => {
      renderMenu();
      const hotspot = screen.getByTestId('settings-hotspot');
      fireEvent.mouseEnter(hotspot);
      const gear = screen.getByLabelText('הגדרות');
      expect(gear.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('tv route (trigger = hover)', () => {
    beforeEach(() => {
      window.location.hash = '#/tv';
    });

    it('mouseEnter on hotspot reveals the gear', () => {
      renderMenu();
      const hotspot = screen.getByTestId('settings-hotspot');
      fireEvent.mouseEnter(hotspot);
      const gear = screen.getByLabelText('הגדרות');
      expect(gear.getAttribute('aria-hidden')).toBe('false');
    });

    it('pointerDown on hotspot does NOT reveal the gear on TV', () => {
      renderMenu();
      const hotspot = screen.getByTestId('settings-hotspot');
      fireEvent.pointerDown(hotspot);
      const gear = screen.getByLabelText('הגדרות');
      expect(gear.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('hotspot tap reveals gear but does NOT open dialog', () => {
    renderMenu();
    fireEvent.pointerDown(screen.getByTestId('settings-hotspot'));
    // Gear is revealed
    expect(screen.getByLabelText('הגדרות').getAttribute('aria-hidden')).toBe('false');
    // But dialog is not open
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('clicking the revealed gear opens the dialog', () => {
    renderMenu();
    fireEvent.pointerDown(screen.getByTestId('settings-hotspot'));
    fireEvent.click(screen.getByLabelText('הגדרות'));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('clicking the hidden gear does NOT open the dialog', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText('הגדרות'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('dialog closes on overlay click', () => {
    renderMenu();
    fireEvent.pointerDown(screen.getByTestId('settings-hotspot'));
    fireEvent.click(screen.getByLabelText('הגדרות'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Click on the overlay (role="presentation")
    fireEvent.click(screen.getByRole('presentation'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('dialog closes on Escape', () => {
    renderMenu();
    fireEvent.pointerDown(screen.getByTestId('settings-hotspot'));
    fireEvent.click(screen.getByLabelText('הגדרות'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  describe('3-finger reveal', () => {
    it('3-finger touchstart on document reveals the gear (tablet)', () => {
      window.location.hash = '';
      renderMenu();
      const touchEvent = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent;
      Object.defineProperty(touchEvent, 'touches', { value: [1, 2, 3] });
      fireEvent(document, touchEvent);
      expect(screen.getByLabelText('הגדרות').getAttribute('aria-hidden')).toBe('false');
    });

    it('3-finger touchstart on document reveals the gear (tv)', () => {
      window.location.hash = '#/tv';
      renderMenu();
      const touchEvent = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent;
      Object.defineProperty(touchEvent, 'touches', { value: [1, 2, 3] });
      fireEvent(document, touchEvent);
      expect(screen.getByLabelText('הגדרות').getAttribute('aria-hidden')).toBe('false');
    });

    it('2-finger touchstart does NOT reveal the gear', () => {
      renderMenu();
      const touchEvent = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent;
      Object.defineProperty(touchEvent, 'touches', { value: [1, 2] });
      fireEvent(document, touchEvent);
      expect(screen.getByLabelText('הגדרות').getAttribute('aria-hidden')).toBe('true');
    });
  });
});
