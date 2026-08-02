/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dayKeyFor, DAY_LABELS } from './dayKey';
import type { ScheduleEvent, Presentation } from '../../store/config/configState';

// Setup localStorage mock (required because configSlice reads it at import time)
const store: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  },
  writable: true,
});

describe('dayKey', () => {
  describe('dayKeyFor', () => {
    it.each([
      [0, 'sunday'],
      [1, 'monday'],
      [2, 'tuesday'],
      [3, 'wednesday'],
      [4, 'thursday'],
      [5, 'friday'],
      [6, 'shabbat'],
    ] as const)('maps getDay() = %i to "%s"', (dayNum, expected) => {
      // Create a date for each weekday (July 2026: Sun=19, Mon=20, ... Sat=25)
      const date = new Date(2026, 6, 19 + dayNum); // July 19 is Sunday
      expect(dayKeyFor(date)).toBe(expected);
    });

    it('uses current date when no argument is provided', () => {
      const result = dayKeyFor();
      const expected = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'shabbat'][new Date().getDay()];
      expect(result).toBe(expected);
    });
  });

  describe('DAY_LABELS', () => {
    it('has Hebrew labels for all 7 days', () => {
      expect(Object.keys(DAY_LABELS)).toHaveLength(7);
      expect(DAY_LABELS.shabbat).toBe('שבת');
      expect(DAY_LABELS.sunday).toBe('יום ראשון');
    });
  });
});

describe('TodaysSchedule', () => {
  // Integration-level rendering test
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it('renders events sorted chronologically', async () => {
    const { render } = await import('@testing-library/react');
    const { Provider } = await import('react-redux');
    const { configureStore } = await import('@reduxjs/toolkit');
    const { default: configReducer, loadConfig } = await import('../../store/config/configSlice');
    const { TodaysSchedule } = await import('./TodaysSchedule');
    const { StateKeys } = await import('../../../store.models');

    const mockConfig = {
      tenant: { id: 'test', displayName: 'Test' },
      displaySettings: { mainDashboardDurationSeconds: 60, presentationDurationSeconds: 20 },
      weeklySchedule: {
        sunday: [
          { time: '21:00', title: 'Arbit', type: 'tefilla' as const },
          { time: '06:30', title: 'Shacharit', type: 'tefilla' as const },
          { time: '20:00', title: 'Daf Yomi', type: 'shiur' as const },
        ],
        monday: [] as ScheduleEvent[], tuesday: [] as ScheduleEvent[], wednesday: [] as ScheduleEvent[], thursday: [] as ScheduleEvent[], friday: [] as ScheduleEvent[],
        shabbat: [{ time: '08:00', title: 'Shacharit', type: 'tefilla' as const }],
      },
      activePresentations: [] as Presentation[],
    };

    // Create store with config already loaded
    const testStore = configureStore({
      reducer: { [StateKeys.Config]: configReducer },
      preloadedState: {
        [StateKeys.Config]: { tenantId: 'test', data: mockConfig, status: 'ready' as const, refreshing: false },
      },
    });

    // We need to know what day the test runs on to pick correct schedule
    const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'shabbat'][new Date().getDay()];
    const expectedEvents = mockConfig.weeklySchedule[today as keyof typeof mockConfig.weeklySchedule];

    const { container, queryAllByRole } = render(
      <Provider store={testStore}>
        <TodaysSchedule />
      </Provider>,
    );

    if (expectedEvents.length === 0) {
      // Panel should not render if no events for today
      expect(container.firstChild).toBeNull();
    } else {
      // Events should appear sorted by time
      const items = container.querySelectorAll('.schedule-item');
      expect(items.length).toBe(expectedEvents.length);

      const times = Array.from(items).map(
        (el) => el.querySelector('.schedule-time')?.textContent,
      );
      const sorted = [...times].sort();
      expect(times).toEqual(sorted);
    }
  });

  it('renders nothing when config has no events for today', async () => {
    const { render } = await import('@testing-library/react');
    const { Provider } = await import('react-redux');
    const { configureStore } = await import('@reduxjs/toolkit');
    const { default: configReducer } = await import('../../store/config/configSlice');
    const { TodaysSchedule } = await import('./TodaysSchedule');
    const { StateKeys } = await import('../../../store.models');

    const emptyConfig = {
      tenant: { id: 'test', displayName: 'Test' },
      displaySettings: { mainDashboardDurationSeconds: 60, presentationDurationSeconds: 20 },
      weeklySchedule: {
        sunday: [] as ScheduleEvent[], monday: [] as ScheduleEvent[], tuesday: [] as ScheduleEvent[], wednesday: [] as ScheduleEvent[],
        thursday: [] as ScheduleEvent[], friday: [] as ScheduleEvent[], shabbat: [] as ScheduleEvent[],
      },
      activePresentations: [] as Presentation[],
    };

    const testStore = configureStore({
      reducer: { [StateKeys.Config]: configReducer },
      preloadedState: {
        [StateKeys.Config]: { tenantId: 'test', data: emptyConfig, status: 'ready' as const, refreshing: false },
      },
    });

    const { container } = render(
      <Provider store={testStore}>
        <TodaysSchedule />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when config is not loaded', async () => {
    const { render } = await import('@testing-library/react');
    const { Provider } = await import('react-redux');
    const { configureStore } = await import('@reduxjs/toolkit');
    const { default: configReducer } = await import('../../store/config/configSlice');
    const { TodaysSchedule } = await import('./TodaysSchedule');
    const { StateKeys } = await import('../../../store.models');

    const testStore = configureStore({
      reducer: { [StateKeys.Config]: configReducer },
      preloadedState: {
        [StateKeys.Config]: { tenantId: null, data: null, status: 'idle' as const, refreshing: false },
      },
    });

    const { container } = render(
      <Provider store={testStore}>
        <TodaysSchedule />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
