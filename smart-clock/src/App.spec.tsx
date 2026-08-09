/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { App } from './App';
import timeReducer from './app/components/store/times/timesSlice';
import titlesReducer from './app/components/store/titles/titlesSlice';
import configReducer from './app/components/store/config/configSlice';
import settingsReducer from './app/components/store/settings/settingsSlice';
import debugReducer from './app/components/store/debug/debugSlice';
import { StateKeys } from './app/store.models';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

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

const DAY = [{ time: '06:30', title: 'שחרית', type: 'tefilla' as const }];

function readyConfig() {
  return {
    [StateKeys.Config]: {
      tenantId: 'test',
      data: {
        tenant: { id: 'test', displayName: 'Test' },
        displaySettings: {
          mainDashboardDurationSeconds: 60,
          presentationDurationSeconds: 20,
          scheduleDaysAhead: 7,
        },
        weeklySchedule: {
          sunday: DAY, monday: DAY, tuesday: DAY, wednesday: DAY,
          thursday: DAY, friday: DAY, shabbat: DAY,
        },
        activePresentations: [] as never[],
      },
      status: 'ready' as const,
      refreshing: false,
    },
  };
}

function renderApp(hash: string, viewOverride: unknown) {
  window.location.hash = hash;
  const store = configureStore({
    reducer: {
      [StateKeys.Times]: timeReducer,
      [StateKeys.Titles]: titlesReducer,
      [StateKeys.Config]: configReducer,
      [StateKeys.Settings]: settingsReducer,
      [StateKeys.Debug]: debugReducer,
    },
    preloadedState: {
      ...readyConfig(),
      [StateKeys.Debug]: {
        enabled: true,
        offsetMs: 0,
        viewOverride,
        rotationFrozen: true,
      },
    } as Parameters<typeof configureStore>[0]['preloadedState'],
  });
  return render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((k) => delete storage[k]);
    window.location.hash = '';
  });

  it('renders the tablet dashboard by default', () => {
    const { container } = renderApp('', null);
    expect(container.querySelector('.clock-app')).toBeTruthy();
  });

  it('renders the TV layout on the #/tv route', () => {
    const { container } = renderApp('#/tv', null);
    expect(container.querySelector('.tv-app')).toBeTruthy();
  });

  it('schedule override on TV renders the calendar inside the TV layout', () => {
    const { container } = renderApp('#/tv', { kind: 'schedule' });
    expect(container.querySelector('.tv-app')).toBeTruthy();
    expect(container.querySelector('.tv-calendar')).toBeTruthy();
    expect(container.querySelectorAll('.cal-day').length).toBeGreaterThan(0);
  });

  it('schedule override on tablet renders the schedule body section', () => {
    const { container } = renderApp('', { kind: 'schedule' });
    expect(container.querySelector('.schedule-body-section')).toBeTruthy();
  });

  it('mounts the debug panel badge when debug is enabled', () => {
    const { container } = renderApp('#/tv', null);
    expect(container.querySelector('.debug-badge')).toBeTruthy();
  });
});
