import { resolveDebugView } from './resolveDebugView';
import type { TenantConfig, Presentation, DisplayMessage } from '../../store/config/configState';

const PRES_A: Presentation = { title: 'Slide A', file: 'a.pdf', type: 'pdf' };
const PRES_B: Presentation = { title: 'Slide B', file: 'b.jpg', type: 'image' };
const DONOR: DisplayMessage = { type: 'donor', title: 'Test', body: 'Body' };

const CONFIG: TenantConfig = {
  tenant: { id: 'test', displayName: 'Test' },
  displaySettings: { mainDashboardDurationSeconds: 30, presentationDurationSeconds: 20 },
  weeklySchedule: { sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], shabbat: [] },
  activePresentations: [PRES_A, PRES_B],
  activeMessages: [DONOR],
};

describe('resolveDebugView', () => {
  it('returns null when override is null', () => {
    expect(resolveDebugView(null, CONFIG)).toBeNull();
  });

  it('returns dashboard view', () => {
    expect(resolveDebugView({ kind: 'dashboard' }, CONFIG)).toEqual({ kind: 'dashboard' });
  });

  it('returns schedule view', () => {
    expect(resolveDebugView({ kind: 'schedule' }, CONFIG)).toEqual({ kind: 'schedule' });
  });

  it('returns messages view when messages exist', () => {
    const result = resolveDebugView({ kind: 'messages' }, CONFIG);
    expect(result).toEqual({ kind: 'messages', messages: [DONOR] });
  });

  it('returns null for messages when activeMessages is empty', () => {
    const config = { ...CONFIG, activeMessages: [] as DisplayMessage[] };
    expect(resolveDebugView({ kind: 'messages' }, config)).toBeNull();
  });

  it('returns null for messages when activeMessages is absent', () => {
    const { activeMessages, ...config } = CONFIG;
    expect(resolveDebugView({ kind: 'messages' }, config as TenantConfig)).toBeNull();
  });

  it('returns the correct presentation by index', () => {
    expect(resolveDebugView({ kind: 'presentation', index: 0 }, CONFIG)).toEqual({
      kind: 'presentation',
      presentation: PRES_A,
    });
    expect(resolveDebugView({ kind: 'presentation', index: 1 }, CONFIG)).toEqual({
      kind: 'presentation',
      presentation: PRES_B,
    });
  });

  it('returns null when presentation index is out of range', () => {
    expect(resolveDebugView({ kind: 'presentation', index: 5 }, CONFIG)).toBeNull();
  });

  it('returns null when presentation index is negative', () => {
    expect(resolveDebugView({ kind: 'presentation', index: -1 }, CONFIG)).toBeNull();
  });

  it('returns null when config is null', () => {
    expect(resolveDebugView({ kind: 'messages' }, null)).toBeNull();
    expect(resolveDebugView({ kind: 'presentation', index: 0 }, null)).toBeNull();
  });

  it('dashboard and schedule work even with null config', () => {
    expect(resolveDebugView({ kind: 'dashboard' }, null)).toEqual({ kind: 'dashboard' });
    expect(resolveDebugView({ kind: 'schedule' }, null)).toEqual({ kind: 'schedule' });
  });
});
