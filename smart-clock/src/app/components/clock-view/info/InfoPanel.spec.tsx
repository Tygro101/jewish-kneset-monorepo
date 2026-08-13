/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { InfoPanel } from './InfoPanel';
import type { InfoPage } from './infoPages';

const prayerPage: InfoPage = {
  group: 'prayer',
  rows: [{ value: 'אין אומרים תחנון במנחה' }, { value: 'מוריד הטל' }],
};

const studyPage: InfoPage = {
  group: 'study',
  rows: [
    { label: 'בבלי', value: 'חולין דף ק״ד' },
    { label: 'ירושלמי', value: 'בבא בתרא דף כ' },
  ],
};

describe('InfoPanel', () => {
  it('renders one row per page row', () => {
    const { container } = render(<InfoPanel page={prayerPage} />);
    expect(container.querySelectorAll('.info-panel-row')).toHaveLength(2);
  });

  it('prayer rows render only the value (no label element)', () => {
    const { container } = render(<InfoPanel page={prayerPage} />);
    expect(container.querySelector('.info-panel-label')).toBeNull();
    expect(container.querySelectorAll('.info-panel-value')).toHaveLength(2);
  });

  it('study rows render label + value', () => {
    const { container } = render(<InfoPanel page={studyPage} />);
    expect(container.querySelectorAll('.info-panel-label')).toHaveLength(2);
    expect(container.querySelector('.info-panel-label')!.textContent).toBe('בבלי');
    expect(container.querySelector('.info-panel-value')!.textContent).toBe('חולין דף ק״ד');
  });

  it('applies is-fading only when fading', () => {
    const { container: idle } = render(<InfoPanel page={studyPage} />);
    expect(idle.querySelector('.info-panel')!.classList.contains('is-fading')).toBe(false);

    const { container: fadingOut } = render(<InfoPanel page={studyPage} fading />);
    expect(fadingOut.querySelector('.info-panel')!.classList.contains('is-fading')).toBe(true);
  });
});
