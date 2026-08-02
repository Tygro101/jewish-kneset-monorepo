/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TvClockView } from './TvClockView';
import timeReducer from '../store/times/timesSlice';
import titlesReducer from '../store/titles/titlesSlice';
import configReducer from '../store/config/configSlice';
import settingsReducer from '../store/settings/settingsSlice';
import { StateKeys } from '../../store.models';

// ResizeObserver is not available in jsdom
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// localStorage mock (required because configSlice reads it at import time)
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

function createTestStore(preloadedState?: Parameters<typeof configureStore>[0]['preloadedState']) {
  return configureStore({
    reducer: {
      [StateKeys.Times]: timeReducer,
      [StateKeys.Titles]: titlesReducer,
      [StateKeys.Config]: configReducer,
      [StateKeys.Settings]: settingsReducer,
    },
    preloadedState,
  });
}

function renderTv(preloadedState?: Parameters<typeof createTestStore>[0]) {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <TvClockView />
    </Provider>,
  );
}

describe('TvClockView', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  it('renders the root with class tv-app', () => {
    const { container } = renderTv();
    expect(container.querySelector('.tv-app')).toBeTruthy();
  });

  it('contains the clock block', () => {
    const { container } = renderTv();
    expect(container.querySelector('.tv-clock-block')).toBeTruthy();
  });

  it('contains the date block', () => {
    const { container } = renderTv();
    expect(container.querySelector('.tv-date-block')).toBeTruthy();
  });

  it('contains the zmanim container inside tv-main', () => {
    const { container } = renderTv();
    const main = container.querySelector('.tv-main');
    expect(main).toBeTruthy();
    expect(main!.querySelector('.tv-zmanim')).toBeTruthy();
  });

  it('contains the titles container inside tv-rail', () => {
    const { container } = renderTv();
    const rail = container.querySelector('.tv-rail');
    expect(rail).toBeTruthy();
    expect(rail!.querySelector('.tv-titles')).toBeTruthy();
  });

  it('has the section title "זמני היום"', () => {
    renderTv();
    expect(screen.getByText('זמני היום')).toBeTruthy();
  });

  it('renders the settings gear button', () => {
    renderTv();
    expect(screen.getByLabelText('הגדרות')).toBeTruthy();
  });

  it('does not render schedule when config has no events', () => {
    const { container } = renderTv();
    expect(container.querySelector('.tv-schedule')).toBeFalsy();
  });

  it('renders the data-route attribute', () => {
    const { container } = renderTv();
    expect(container.querySelector('[data-route="tv"]')).toBeTruthy();
  });
});
