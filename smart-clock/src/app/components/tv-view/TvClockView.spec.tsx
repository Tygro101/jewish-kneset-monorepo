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
import { TitlesKeys } from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import { __resetInfoCursorForTests } from '../clock-view/info/infoRotationCursor';

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

  it('renders the full-width info panel instead of the old two-column info cards', () => {
    const { container } = renderTv({
      ...CONFIG_WITH_SCHEDULE,
      [StateKeys.Titles]: {
        [TitlesKeys.DafYomi]: { title: 'חולין דף ק״ד', streak: 99 },
      },
    });
    expect(container.querySelector('.info-panel')).toBeTruthy();
    expect(container.querySelector('.info-cards')).toBeNull();
  });

  it('shows 3 info rows per page on TV (rowsPerPage=3)', () => {
    __resetInfoCursorForTests();
    const { container } = renderTv({
      ...CONFIG_WITH_SCHEDULE,
      [StateKeys.Titles]: {
        // 3 prayer items → a single page of 3 rows when rowsPerPage=3
        [TitlesKeys.Tachanun]: { title: 'אין אומרים תחנון במנחה', streak: 99 },
        [TitlesKeys.MashivAruach]: { title: 'מוריד הטל', streak: 99 },
        [TitlesKeys.BarechAlino]: { title: 'ברכנו', streak: 99 },
      },
    });
    expect(container.querySelectorAll('.info-panel-row')).toHaveLength(3);
  });

  it('does not render redundant "זמני היום" section title', () => {
    renderTv();
    expect(screen.queryByText('זמני היום')).toBeNull();
  });

  it('renders the settings gear hidden behind a hotspot', () => {
    renderTv();
    const gear = screen.getByLabelText('הגדרות');
    expect(gear).toBeTruthy();
    // Gear is hidden by default (not revealed)
    expect(gear.getAttribute('aria-hidden')).toBe('true');
    // The hotspot is present for hover-reveal
    expect(screen.getByTestId('settings-hotspot')).toBeTruthy();
  });

  it('always renders the calendar column (even with empty schedule)', () => {
    const { container } = renderTv();
    expect(container.querySelector('.tv-calendar')).toBeTruthy();
  });

  it('renders calendar with day columns when schedule has events', () => {
    const { container } = renderTv(CONFIG_WITH_SCHEDULE);
    expect(container.querySelectorAll('.cal-day').length).toBeGreaterThan(0);
  });

  it('with no calendarOverride and schedule data, .cal-day still renders', () => {
    const { container } = renderTv(CONFIG_WITH_SCHEDULE);
    expect(container.querySelectorAll('.cal-day').length).toBeGreaterThan(0);
  });

  it('with calendarOverride, override renders inside .tv-calendar and .cal-day is absent', () => {
    const store = createTestStore(CONFIG_WITH_SCHEDULE);
    const { container } = render(
      <Provider store={store}>
        <TvClockView calendarOverride={<div data-testid="override" />} />
      </Provider>,
    );
    const tvCal = container.querySelector('.tv-calendar');
    expect(tvCal!.querySelector('[data-testid="override"]')).toBeTruthy();
    expect(container.querySelector('.cal-day')).toBeNull();
  });

  it('with calendarOverride, the clock block still renders', () => {
    const store = createTestStore(CONFIG_WITH_SCHEDULE);
    const { container } = render(
      <Provider store={store}>
        <TvClockView calendarOverride={<div />} />
      </Provider>,
    );
    expect(container.querySelector('.tv-dashboard .dashboard-shell .header-section')).toBeTruthy();
  });
});
