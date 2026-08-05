import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getDebugEnabled, getDebugViewOverride, getDebugRotationFrozen, getDebugOffsetMs } from '../store/debug/debugSelectors';
import { setViewOverride, clearViewOverride, setRotationFrozen, syncOffsetMs } from '../store/debug/debugSlice';
import { getConfigDataSelector } from '../store/config/configSelectors';
import { getConfigSelector } from '../store/config/configSelectors';
import { refreshConfig } from '../store/config/configSlice';
import { now, getOffsetMs, setOffsetMs, clearOffset, computeOffsetFromTarget } from '../../debug/clock';
import './DebugPanel.scss';

/**
 * DebugPanel — developer-only floating dialog.
 * Opens with Ctrl+Shift+D or by clicking the DEBUG badge.
 * Returns null when debug mode is not enabled.
 */
export const DebugPanel = () => {
  const enabled = useAppSelector(getDebugEnabled);
  const [open, setOpen] = useState(false);

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled, open]);

  if (!enabled) return null;

  return (
    <>
      {/* Corner badge — always visible when debug is on */}
      <button className="debug-badge" onClick={() => setOpen(true)} title="Open Debug Panel (Ctrl+Shift+D)">
        DEBUG
      </button>

      {open && (
        <>
          <div className="debug-overlay" onClick={() => setOpen(false)} />
          <div className="debug-panel" role="dialog" aria-modal="true" aria-label="Debug Panel">
            <PanelContent onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
};

function PanelContent({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const config = useAppSelector(getConfigDataSelector);
  const { refreshing, lastRefreshError } = useAppSelector(getConfigSelector);
  const viewOverride = useAppSelector(getDebugViewOverride);
  const rotationFrozen = useAppSelector(getDebugRotationFrozen);
  const offsetMs = useAppSelector(getDebugOffsetMs);

  // --- Time section ---
  const [timeInput, setTimeInput] = useState(() => toLocalISOString(now()));
  const inputRef = useRef<HTMLInputElement>(null);

  const handleApplyTime = useCallback(() => {
    const target = new Date(timeInput);
    if (isNaN(target.getTime())) return;
    const offset = computeOffsetFromTarget(target, new Date());
    setOffsetMs(offset);
    dispatch(syncOffsetMs(offset));
    window.location.reload();
  }, [timeInput, dispatch]);

  const handleNudge = useCallback((deltaMs: number) => {
    const newOffset = getOffsetMs() + deltaMs;
    setOffsetMs(newOffset);
    dispatch(syncOffsetMs(newOffset));
    window.location.reload();
  }, [dispatch]);

  const handleResetTime = useCallback(() => {
    clearOffset();
    dispatch(syncOffsetMs(0));
    window.location.reload();
  }, [dispatch]);

  // --- Config section ---
  const handleRefreshConfig = useCallback(() => {
    dispatch(refreshConfig());
  }, [dispatch]);

  const handleHardReload = useCallback(() => {
    window.location.reload();
  }, []);

  // --- View section ---
  const presentations = config?.activePresentations ?? [];
  const hasMessages = (config?.activeMessages?.length ?? 0) > 0;
  const [selectedPresIdx, setSelectedPresIdx] = useState(0);

  const handleViewDashboard = () => dispatch(setViewOverride({ kind: 'dashboard' }));
  const handleViewSchedule = () => dispatch(setViewOverride({ kind: 'schedule' }));
  const handleViewMessages = () => dispatch(setViewOverride({ kind: 'messages' }));
  const handleViewPresentation = () => dispatch(setViewOverride({ kind: 'presentation', index: selectedPresIdx }));
  const handleClearOverride = () => dispatch(clearViewOverride());
  const handleToggleFreeze = () => dispatch(setRotationFrozen(!rotationFrozen));

  return (
    <>
      <div className="debug-panel-header">
        <span className="debug-panel-title">⚙ Debug Panel</span>
        <button className="debug-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* ── Time ── */}
      <div className="debug-section">
        <div className="debug-section-label">Clock Time</div>
        <div className="debug-row">
          <input
            ref={inputRef}
            type="datetime-local"
            className="debug-input"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            step="1"
          />
          <button className="debug-btn debug-btn--primary" onClick={handleApplyTime}>
            Apply &amp; Reload
          </button>
        </div>
        <div className="debug-row">
          <button className="debug-btn" onClick={() => handleNudge(-60 * 60 * 1000)}>−1h</button>
          <button className="debug-btn" onClick={() => handleNudge(60 * 60 * 1000)}>+1h</button>
          <button className="debug-btn" onClick={() => handleNudge(-24 * 60 * 60 * 1000)}>−1d</button>
          <button className="debug-btn" onClick={() => handleNudge(24 * 60 * 60 * 1000)}>+1d</button>
          <button className="debug-btn debug-btn--danger" onClick={handleResetTime}>Reset</button>
        </div>
        <div className="debug-info">
          Offset: {formatOffsetMs(offsetMs)} | Effective: {now().toLocaleString('he-IL')}
        </div>
      </div>

      <hr className="debug-divider" />

      {/* ── Config ── */}
      <div className="debug-section">
        <div className="debug-section-label">Config</div>
        <div className="debug-row">
          <button className="debug-btn debug-btn--primary" onClick={handleRefreshConfig} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh Config'}
          </button>
          <button className="debug-btn" onClick={handleHardReload}>Hard Reload</button>
          {refreshing && <span className="debug-status debug-status--refreshing">⟳</span>}
          {lastRefreshError && <span className="debug-status debug-status--error">✗ {lastRefreshError}</span>}
        </div>
      </div>

      <hr className="debug-divider" />

      {/* ── Views ── */}
      <div className="debug-section">
        <div className="debug-section-label">View Override</div>
        <div className="debug-row">
          <button
            className={`debug-btn ${viewOverride?.kind === 'dashboard' ? 'debug-btn--active' : ''}`}
            onClick={handleViewDashboard}
          >
            Dashboard
          </button>
          <button
            className={`debug-btn ${viewOverride?.kind === 'schedule' ? 'debug-btn--active' : ''}`}
            onClick={handleViewSchedule}
          >
            Schedule
          </button>
          <button
            className={`debug-btn ${viewOverride?.kind === 'messages' ? 'debug-btn--active' : ''}`}
            onClick={handleViewMessages}
            disabled={!hasMessages}
          >
            Messages
          </button>
        </div>
        {presentations.length > 0 && (
          <div className="debug-row">
            <select
              className="debug-select"
              value={selectedPresIdx}
              onChange={(e) => setSelectedPresIdx(Number(e.target.value))}
            >
              {presentations.map((p, i) => (
                <option key={i} value={i}>{i}: {p.title || p.file}</option>
              ))}
            </select>
            <button
              className={`debug-btn ${viewOverride?.kind === 'presentation' ? 'debug-btn--active' : ''}`}
              onClick={handleViewPresentation}
            >
              Show Slide
            </button>
          </div>
        )}
        <div className="debug-row" style={{ marginTop: 8 }}>
          <button
            className={`debug-btn ${rotationFrozen ? 'debug-btn--active' : ''}`}
            onClick={handleToggleFreeze}
          >
            {rotationFrozen ? '❄ Frozen' : '▶ Running'}
          </button>
          <button className="debug-btn" onClick={handleClearOverride} disabled={!viewOverride}>
            Clear Override
          </button>
        </div>
        <div className="debug-info">
          Override: {viewOverride ? describeOverride(viewOverride) : 'none'} | Rotation: {rotationFrozen ? 'paused' : 'active'}
        </div>
      </div>
    </>
  );
}

// --- Helpers ---

function toLocalISOString(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatOffsetMs(ms: number): string {
  if (ms === 0) return 'none';
  const sign = ms > 0 ? '+' : '−';
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  if (h > 0 && m > 0) return `${sign}${h}h ${m}m`;
  if (h > 0) return `${sign}${h}h`;
  return `${sign}${m}m`;
}

function describeOverride(o: NonNullable<ReturnType<typeof getDebugViewOverride>>): string {
  if (!o) return 'none';
  if (o.kind === 'presentation') return `presentation[${o.index}]`;
  return o.kind;
}
