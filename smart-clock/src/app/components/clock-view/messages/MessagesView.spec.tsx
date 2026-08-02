/**
 * @vitest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { DisplayMessage } from '../../store/config/configState';
import { MessagesView } from './MessagesView';

function makeMessage(overrides: Partial<DisplayMessage> = {}): DisplayMessage {
  return {
    type: 'donor',
    title: 'משפחת כהן',
    body: 'תודה רבה',
    ...overrides,
  };
}

describe('MessagesView', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('renders the first message badge, name and body', () => {
    render(<MessagesView messages={[makeMessage()]} defaultSeconds={20} />);
    expect(screen.getByText('הוקרת תורם')).toBeInTheDocument();
    expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
    expect(screen.getByText('תודה רבה')).toBeInTheDocument();
  });

  it('splits multi-line title into multiple name rows', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage({ title: 'משפחת כהן\nמשפחת לוי' })]} defaultSeconds={20} />,
    );
    const names = container.querySelectorAll('.messages-name');
    expect(names).toHaveLength(2);
    expect(names[0].textContent).toBe('משפחת כהן');
    expect(names[1].textContent).toBe('משפחת לוי');
    expect(names[0].classList.contains('is-multi')).toBe(true);
  });

  it('single-line title renders without is-multi class', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage({ title: 'שם בודד' })]} defaultSeconds={20} />,
    );
    const names = container.querySelectorAll('.messages-name');
    expect(names).toHaveLength(1);
    expect(names[0].classList.contains('is-multi')).toBe(false);
  });

  it('advances to next message after duration elapses', () => {
    const messages = [
      makeMessage({ title: 'ראשון' }),
      makeMessage({ title: 'שני' }),
    ];
    render(<MessagesView messages={messages} defaultSeconds={20} />);
    expect(screen.getByText('ראשון')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(20000); });
    expect(screen.getByText('שני')).toBeInTheDocument();
  });

  it('single message never advances', () => {
    render(<MessagesView messages={[makeMessage()]} defaultSeconds={20} />);
    act(() => { vi.advanceTimersByTime(60000); });
    expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
  });

  it('empty messages renders nothing', () => {
    const { container } = render(<MessagesView messages={[]} defaultSeconds={20} />);
    expect(container.querySelector('.messages-view')).toBeNull();
  });

  it('unrecognised type falls back without crashing', () => {
    const msg = makeMessage({ type: 'bogus' as any });
    render(<MessagesView messages={[msg]} defaultSeconds={20} />);
    // Falls back to announcement label
    expect(screen.getByText('הודעה')).toBeInTheDocument();
  });
});
