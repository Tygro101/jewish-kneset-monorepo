import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** When > 0, reloads the page automatically after this many ms. 0 disables. */
  autoReloadMs?: number;
}

interface State {
  error: Error | null;
}

/**
 * Root error boundary.
 *
 * On a kiosk display an unhandled render error leaves a blank screen, so we show
 * a readable fallback and (optionally) reload automatically after a delay.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  private reloadTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
    const delay = this.props.autoReloadMs ?? 0;
    if (delay > 0 && this.reloadTimer === null) {
      this.reloadTimer = setTimeout(() => window.location.reload(), delay);
    }
  }

  componentWillUnmount(): void {
    if (this.reloadTimer !== null) {
      clearTimeout(this.reloadTimer);
      this.reloadTimer = null;
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          data-testid="error-boundary-fallback"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            height: '100vh',
            background: 'var(--bg-primary, #0b1020)',
            color: '#ddd',
            fontSize: '1.3rem',
            direction: 'rtl',
          }}
        >
          <p>אירעה שגיאה בתצוגה</p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.6rem 1.4rem',
              fontSize: '1rem',
              borderRadius: 6,
              border: '1px solid #555',
              background: '#222',
              color: '#eee',
              cursor: 'pointer',
            }}
          >
            רענון
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
