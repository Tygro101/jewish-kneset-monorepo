/**
 * @vitest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { DisplayMessage } from '../../store/config/configState';
import { MessagesView } from './MessagesView';

// ResizeObserver is not available in jsdom
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

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

  // ── New assertions for the in-layout rewrite ──

  it('.messages-names carries size-md for a 22-char title', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage({ title: 'הילולת אור החיים הקדוש' })]} defaultSeconds={20} />,
    );
    const namesBlock = container.querySelector('.messages-names');
    expect(namesBlock!.classList.contains('size-md')).toBe(true);
  });

  it('.messages-names carries size-xl for a short title', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage({ title: 'מזל טוב' })]} defaultSeconds={20} />,
    );
    const namesBlock = container.querySelector('.messages-names');
    expect(namesBlock!.classList.contains('size-xl')).toBe(true);
  });

  it('.messages-footer absent with 1 message', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage()]} defaultSeconds={20} />,
    );
    expect(container.querySelector('.messages-footer')).toBeNull();
  });

  it('.messages-footer present with 2 messages and has exactly 1 active dot', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage(), makeMessage({ title: 'שני' })]} defaultSeconds={20} />,
    );
    const footer = container.querySelector('.messages-footer');
    expect(footer).toBeTruthy();
    const activeDots = container.querySelectorAll('.messages-dot.is-active');
    expect(activeDots).toHaveLength(1);
  });

  it('root .messages-view has no fixed/absolute positioning', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage()]} defaultSeconds={20} />,
    );
    const root = container.querySelector('.messages-view') as HTMLElement;
    expect(root).toBeTruthy();
    // Inline style should not contain position
    expect(root.style.position).toBe('');
  });

  it('.messages-dots and .messages-counter are both inside .messages-footer', () => {
    const { container } = render(
      <MessagesView messages={[makeMessage(), makeMessage({ title: 'ב' })]} defaultSeconds={20} />,
    );
    const footer = container.querySelector('.messages-footer')!;
    expect(footer.querySelector('.messages-dots')).toBeTruthy();
    expect(footer.querySelector('.messages-counter')).toBeTruthy();
  });
});
