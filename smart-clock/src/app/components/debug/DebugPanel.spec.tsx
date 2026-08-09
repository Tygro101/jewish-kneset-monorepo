/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DebugPanel } from './DebugPanel';
import debugReducer from '../store/debug/debugSlice';
import configReducer from '../store/config/configSlice';
import settingsReducer from '../store/settings/settingsSlice';

// Mock localStorage
const storage: Record<string, string> = {};
const mockStorage = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete storage[key]; }),
  clear: vi.fn(() => { Object.keys(storage).forEach((k) => delete storage[k]); }),
  get length() { return Object.keys(storage).length; },
  key: vi.fn((i: number) => Object.keys(storage)[i] ?? null),
};
Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true });

function createStore(debugEnabled: boolean) {
  return configureStore({
    reducer: {
      debug: debugReducer,
      config: configReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      debug: {
        enabled: debugEnabled,
        offsetMs: 0,
        viewOverride: null,
        rotationFrozen: false,
      },
    },
  });
}

function renderPanel(debugEnabled = true) {
  const store = createStore(debugEnabled);
  return {
    store,
    ...render(
      <Provider store={store}>
        <DebugPanel />
      </Provider>
    ),
  };
}

describe('DebugPanel', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('renders nothing when debug is disabled', () => {
    const { container } = renderPanel(false);
    expect(container.querySelector('.debug-badge')).toBeNull();
  });

  it('renders the badge when debug is enabled', () => {
    renderPanel(true);
    expect(screen.getByText('DEBUG')).toBeTruthy();
  });

  it('opens the panel when badge is clicked', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('opens the panel with Ctrl+Shift+D', () => {
    renderPanel(true);
    fireEvent.keyDown(document, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('closes with Escape', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows view buttons: Dashboard, Schedule, Messages', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Schedule')).toBeTruthy();
    expect(screen.getByText('Messages')).toBeTruthy();
  });

  it('dispatches setViewOverride when Dashboard is clicked', () => {
    const { store } = renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    fireEvent.click(screen.getByText('Dashboard'));
    expect(store.getState().debug.viewOverride).toEqual({ kind: 'dashboard' });
  });

  it('dispatches setRotationFrozen when freeze button is clicked', () => {
    const { store } = renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    fireEvent.click(screen.getByText('▶ Running'));
    expect(store.getState().debug.rotationFrozen).toBe(true);
  });

  it('shows time controls', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    expect(screen.getByText('Apply & Reload')).toBeTruthy();
    expect(screen.getByText('+1h')).toBeTruthy();
    expect(screen.getByText('−1h')).toBeTruthy();
    expect(screen.getByText('+1d')).toBeTruthy();
    expect(screen.getByText('−1d')).toBeTruthy();
    expect(screen.getByText('Reset')).toBeTruthy();
  });

  it('shows config refresh button', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    expect(screen.getByText('Refresh Config')).toBeTruthy();
    expect(screen.getByText('Hard Reload')).toBeTruthy();
  });

  it('shows the route section with Tablet and TV buttons', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    expect(screen.getByText('Tablet')).toBeTruthy();
    expect(screen.getByText('TV')).toBeTruthy();
  });

  it('switches the location hash to #/tv when TV is clicked', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    fireEvent.click(screen.getByText('TV'));
    expect(window.location.hash).toBe('#/tv');
  });

  it('switches back to the tablet route', () => {
    renderPanel(true);
    fireEvent.click(screen.getByText('DEBUG'));
    fireEvent.click(screen.getByText('TV'));
    fireEvent.click(screen.getByText('Tablet'));
    expect(window.location.hash).toBe('#/');
  });
});
