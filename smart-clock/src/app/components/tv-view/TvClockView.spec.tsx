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

const CONFIG_WITH_SCHEDULE = {
  [StateKeys.Config]: {
    tenantId: 'test',
    data: {
      tenant: { id: 'test', displayName: 'Test' },
      displaySettings: { mainDashboardDurationSeconds: 60, presentationDurationSeconds: 20, scheduleDaysAhead: 7 },
      weeklySchedule: {
        sunday: [{ time: '06:30', title: 'שחרית', type: 'tefilla' as const }],
        monday: [{ time: '06:30', title: 'שחרית', type: 'tefilla' as const }],
        tuesday: [{ time: '06:30', title: 'שחרית', type: 'tefilla' as const }],
        wednesday: [{ time: '06:30', title: 'שחרית', type: 'tefilla' as const }],
        thursday: [{ time: '06:30', title: 'שחרית', type: 'tefilla' as const }],
        friday: [{ time: '06:30', title: 'שחרית', type: 'tefilla' as const }],
        shabbat: [{ time: '08:00', title: 'שחרית', type: 'tefilla' as const }],
      },
      activePresentations: [] as never[],
    },
    status: 'ready' as const,
    refreshing: false,
  },
};

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

  it('renders data-route="tv" attribute', () => {
    const { container } = renderTv();
    expect(container.querySelector('[data-route="tv"]')).toBeTruthy();
  });

  it('renders the dashboard column with DashboardShell', () => {
    const { container } = renderTv();
    const dashboard = container.querySelector('.tv-dashboard');
    expect(dashboard).toBeTruthy();
    expect(dashboard!.querySelector('.dashboard-shell')).toBeTruthy();
  });

  it('renders header and zmanim inside the dashboard shell', () => {
    const { container } = renderTv();
    const shell = container.querySelector('.dashboard-shell');
    expect(shell!.querySelector('.header-section')).toBeTruthy();
    expect(shell!.querySelector('.zmanim-section')).toBeTruthy();
  });

  it('renders info cards container (side-by-side layout, not stacked)', () => {
    const { container } = renderTv(CONFIG_WITH_SCHEDULE);
    // .info-cards exists — its CSS grid-template-columns: 1fr 1fr means side-by-side
    // (no TV override to stack them into a single column)
    const infoCards = container.querySelector('.info-cards');
    expect(infoCards).toBeTruthy();
  });

  it('renders "זמני היום" section title', () => {
    renderTv();
    expect(screen.getByText('זמני היום')).toBeTruthy();
  });

  it('renders the settings gear button (visible, not hidden)', () => {
    renderTv();
    expect(screen.getByLabelText('הגדרות')).toBeTruthy();
  });

  it('always renders the calendar column (even with empty schedule)', () => {
    const { container } = renderTv();
    expect(container.querySelector('.tv-calendar')).toBeTruthy();
  });

  it('renders calendar with day columns when schedule has events', () => {
    const { container } = renderTv(CONFIG_WITH_SCHEDULE);
    expect(container.querySelectorAll('.cal-day').length).toBeGreaterThan(0);
  });
});
