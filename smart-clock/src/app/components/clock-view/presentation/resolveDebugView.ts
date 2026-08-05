import type { TenantConfig } from '../../store/config/configState';
import type { DisplayView } from './useDisplayRotation';
import type { DebugViewOverride } from '../../store/debug/debugState';

/**
 * Maps a debug view override to a concrete DisplayView.
 * Returns null when the override is null or the requested content is absent/out-of-range.
 */
export function resolveDebugView(
  override: DebugViewOverride,
  config: TenantConfig | null,
): DisplayView | null {
  if (!override) return null;

  switch (override.kind) {
    case 'dashboard':
      return { kind: 'dashboard' };

    case 'schedule':
      return { kind: 'schedule' };

    case 'messages': {
      const messages = config?.activeMessages;
      if (!messages || messages.length === 0) return null;
      return { kind: 'messages', messages };
    }

    case 'presentation': {
      const presentations = config?.activePresentations;
      if (!presentations || override.index < 0 || override.index >= presentations.length) {
        return null;
      }
      return { kind: 'presentation', presentation: presentations[override.index] };
    }

    default:
      return null;
  }
}
