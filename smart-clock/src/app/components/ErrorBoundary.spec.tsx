/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>ok</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('ok')).toBeTruthy();
  });

  it('renders the fallback when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();
    expect(screen.getByText('אירעה שגיאה בתצוגה')).toBeTruthy();
  });

  it('does not schedule a reload when autoReloadMs is omitted', () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it('schedules a reload when autoReloadMs is set', () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary autoReloadMs={30000}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(vi.getTimerCount()).toBeGreaterThan(0);
  });
});
