/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScheduleTimeline } from '../ScheduleTimeline';
import { densityForColumns, blockVariantFor, pillsInlineFor } from '../density';
import type { TimelineDay, TimelineWindow } from '@shared/core/schedule/schedule.models';

const WINDOW: TimelineWindow = { startMin: 360, endMin: 1320 };

function makeDay(overrides: Partial<TimelineDay> = {}): TimelineDay {
  return {
    date: new Date(2026, 6, 20),
    dayKey: 'monday',
    dayContext: { isShabbat: false, isYomTov: false, isErevShabbat: false, isErevYomTov: false },
    offset: 0,
    isToday: true,
    label: 'היום',
    sublabel: 'יום שני, 20 ביולי 2026',
    events: [
      { id: 'e0', title: 'שחרית', type: 'tefilla', startMin: 390, endMin: 450, clipped: false, hasExplicitEnd: false },
      { id: 'e1', title: 'מנחה', type: 'tefilla', startMin: 780, endMin: 805, clipped: false, hasExplicitEnd: false },
    ],
    ...overrides,
  };
}

describe('density', () => {
  describe('densityForColumns', () => {
    it('1–3 columns → comfortable', () => {
      expect(densityForColumns(1)).toBe('comfortable');
      expect(densityForColumns(2)).toBe('comfortable');
      expect(densityForColumns(3)).toBe('comfortable');
    });

    it('4–5 columns → compact', () => {
      expect(densityForColumns(4)).toBe('compact');
      expect(densityForColumns(5)).toBe('compact');
    });

    it('6–7 columns → minimal', () => {
      expect(densityForColumns(6)).toBe('minimal');
      expect(densityForColumns(7)).toBe('minimal');
    });
  });

  describe('blockVariantFor', () => {
    it('minimal density always returns tight', () => {
      expect(blockVariantFor(120, 'minimal')).toBe('tight');
    });

    it('short duration (<25) returns tight regardless of density', () => {
      expect(blockVariantFor(20, 'comfortable')).toBe('tight');
    });

    it('compact density with duration >= 25 returns standard', () => {
      expect(blockVariantFor(45, 'compact')).toBe('standard');
    });

    it('comfortable density with long duration returns full', () => {
      expect(blockVariantFor(60, 'comfortable')).toBe('full');
    });

    it('comfortable density with medium duration (<45) returns standard', () => {
      expect(blockVariantFor(30, 'comfortable')).toBe('standard');
    });
  });

  describe('pillsInlineFor', () => {
    it('blocks under 45 minutes inline their pills', () => {
      expect(pillsInlineFor(25)).toBe(true);
      expect(pillsInlineFor(44)).toBe(true);
    });

    it('blocks of 45 minutes or more keep pills stacked', () => {
      expect(pillsInlineFor(45)).toBe(false);
      expect(pillsInlineFor(120)).toBe(false);
    });
  });
});

describe('ScheduleTimeline', () => {
  it('renders the correct number of day columns', () => {
    const days = [makeDay(), makeDay({ offset: 1, isToday: false, label: 'מחר' })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={600} density="comfortable" />,
    );
    expect(container.querySelectorAll('.cal-day')).toHaveLength(2);
  });

  it('marks the today column with cal-day--today', () => {
    const days = [makeDay(), makeDay({ offset: 1, isToday: false, label: 'מחר' })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={600} density="comfortable" />,
    );
    const todayCols = container.querySelectorAll('.cal-day--today');
    expect(todayCols).toHaveLength(1);
  });

  it('renders the now pill only on the today column', () => {
    const days = [makeDay(), makeDay({ offset: 1, isToday: false, label: 'מחר' })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={600} density="comfortable" />,
    );
    expect(container.querySelectorAll('.cal-day-now-pill')).toHaveLength(1);
  });

  it('renders NowLine only on today column', () => {
    const days = [makeDay(), makeDay({ offset: 1, isToday: false, label: 'מחר' })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={600} density="comfortable" />,
    );
    expect(container.querySelectorAll('.cal-now')).toHaveLength(1);
  });

  it('does not render NowLine when nowMin is null', () => {
    const days = [makeDay()];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    expect(container.querySelectorAll('.cal-now')).toHaveLength(0);
  });

  it('renders event blocks with correct category classes', () => {
    const days = [makeDay()];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    expect(container.querySelectorAll('.cal-block--tefilla')).toHaveLength(2);
  });

  it('marks in-progress event as cal-block--current', () => {
    // nowMin=400 is during שחרית (390–450)
    const days = [makeDay()];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={400} density="comfortable" />,
    );
    const current = container.querySelectorAll('.cal-block--current');
    expect(current).toHaveLength(1);
  });

  it('marks past events as cal-block--past', () => {
    // nowMin=500 is after שחרית (390–450) ends
    const days = [makeDay()];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={500} density="comfortable" />,
    );
    const past = container.querySelectorAll('.cal-block--past');
    expect(past).toHaveLength(1);
  });

  it('renders title when provided', () => {
    const days = [makeDay()];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" title="לוח זמנים" />,
    );
    expect(container.querySelector('.cal-title')?.textContent).toBe('לוח זמנים');
  });

  it('does not render header when title is omitted', () => {
    const days = [makeDay()];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    expect(container.querySelector('.cal-header')).toBeNull();
  });

  it('in minimal density, only start pill is shown (no end pill)', () => {
    const day = makeDay({
      events: [{ id: 'e0', title: 'שחרית', type: 'tefilla', startMin: 390, endMin: 450, clipped: false, hasExplicitEnd: true }],
    });
    const { container } = render(
      <ScheduleTimeline days={[day]} window={WINDOW} nowMin={null} density="minimal" />,
    );
    const pills = container.querySelectorAll('.cal-pill');
    expect(pills).toHaveLength(1);
    expect(pills[0].classList.contains('cal-pill--faded')).toBe(false);
  });

  it('in comfortable density with long event, both pills and subtitle shown', () => {
    const day = makeDay({
      events: [{ id: 'e0', title: 'שחרית', subtitle: 'תפילת הציבור', type: 'tefilla', startMin: 390, endMin: 450, clipped: false, hasExplicitEnd: true }],
    });
    const { container } = render(
      <ScheduleTimeline days={[day]} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    const pills = container.querySelectorAll('.cal-pill');
    expect(pills).toHaveLength(2);
    expect(container.querySelector('.cal-block-subtitle')?.textContent).toBe('תפילת הציבור');
  });

  it('sets --cal-cols CSS variable for column count', () => {
    const days = [makeDay(), makeDay({ offset: 1, isToday: false, label: 'מחר' }), makeDay({ offset: 2, isToday: false, label: 'יום רביעי' })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    const root = container.querySelector('.cal-root') as HTMLElement;
    expect(root.style.getPropertyValue('--cal-cols')).toBe('3');
  });

  it('renders hour grid lines', () => {
    const days = [makeDay()];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    const hourLines = container.querySelectorAll('.cal-hour-line');
    // 06:00–22:00 = 17 marks
    expect(hourLines.length).toBe(17);
  });

  it('sizes event block via min-height/max-height, not a fixed height', () => {
    // שחרית: 390–450, window 360–1320 (span=960), only event in the day
    // topPct       = (390-360)/960 * 100 = 3.125%
    // minHeight    = 60/960 * 100        = 6.25%
    // maxHeight    = (1320-390)/960 *100 = 96.875%  (grows to window end)
    const days = [makeDay({ events: [{ id: 'e0', title: 'שחרית', type: 'tefilla', startMin: 390, endMin: 450, clipped: false, hasExplicitEnd: false }] })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    const block = container.querySelector('.cal-block') as HTMLElement;
    expect(block.style.top).toBe('3.125%');
    expect(block.style.height).toBe('');
    expect(block.style.minHeight).toBe('6.25%');
    expect(block.style.maxHeight).toBe('96.875%');
  });

  it('caps max-height at the next event start so blocks cannot overlap', () => {
    // e0 780–804 (24min → min 2.5%), e1 starts 828 → max (828-780)/960 = 5%
    const days = [makeDay({ events: [
      { id: 'e0', title: 'מנחה', type: 'tefilla', startMin: 780, endMin: 804, clipped: false, hasExplicitEnd: false },
      { id: 'e1', title: 'ערבית', type: 'tefilla', startMin: 828, endMin: 888, clipped: false, hasExplicitEnd: false },
    ] })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    const first = container.querySelectorAll('.cal-block')[0] as HTMLElement;
    expect(first.style.minHeight).toBe('2.5%');
    expect(first.style.maxHeight).toBe('5%');
  });

  it('adds cal-block--pills-inline to short two-pill blocks', () => {
    // 30 minutes → standard variant (end pill shown) and under the 45min threshold
    const days = [makeDay({ events: [{ id: 'e0', title: 'מנחה', type: 'tefilla', startMin: 780, endMin: 810, clipped: false, hasExplicitEnd: true }] })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    expect(container.querySelectorAll('.cal-pill')).toHaveLength(2);
    expect(container.querySelector('.cal-block')?.classList.contains('cal-block--pills-inline')).toBe(true);
  });

  it('keeps pills stacked on long blocks', () => {
    const days = [makeDay({ events: [{ id: 'e0', title: 'שחרית', type: 'tefilla', startMin: 390, endMin: 450, clipped: false, hasExplicitEnd: true }] })];
    const { container } = render(
      <ScheduleTimeline days={days} window={WINDOW} nowMin={null} density="comfortable" />,
    );
    expect(container.querySelector('.cal-block')?.classList.contains('cal-block--pills-inline')).toBe(false);
  });
});
