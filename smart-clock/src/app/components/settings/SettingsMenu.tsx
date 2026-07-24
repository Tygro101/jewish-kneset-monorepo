import { useEffect, useState } from 'react';
import { THEME_FAMILIES, applyTheme, loadTheme, ThemeMode } from '../../shared/themes';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
    getNetzCountdownEnabledSelector,
    getNetzCountdownMinutesSelector,
} from '../store/settings/settingsSelectors';
import {
    setNetzCountdownEnabled,
    setNetzCountdownMinutes,
} from '../store/settings/settingsSlice';
import { NETZ_COUNTDOWN_MINUTE_OPTIONS } from '../store/settings/settingsState';
import './SettingsMenu.scss';

export const SettingsMenu = () => {
    const initial = loadTheme();
    const [familyId, setFamilyId] = useState(initial.familyId);
    const [mode, setMode] = useState<ThemeMode>(initial.mode);
    const [open, setOpen] = useState(false);

    const dispatch = useAppDispatch();
    const countdownEnabled = useAppSelector(getNetzCountdownEnabledSelector);
    const countdownMinutes = useAppSelector(getNetzCountdownMinutesSelector);

    // Apply theme whenever the selection changes (also runs once on mount).
    useEffect(() => {
        applyTheme(familyId, mode);
    }, [familyId, mode]);

    // Close the dialog on Escape.
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        if (open) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <div className="settings">
            <button
                className="settings-gear"
                aria-label="הגדרות"
                onClick={() => setOpen(true)}
            >
                <GearIcon />
            </button>

            {open && (
                <div
                    className="settings-overlay"
                    onClick={() => setOpen(false)}
                    role="presentation"
                >
                    <div
                        className="settings-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label="הגדרות תצוגה"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="settings-dialog-header">
                            <span className="settings-dialog-title">הגדרות</span>
                            <button
                                className="settings-close"
                                aria-label="סגור"
                                onClick={() => setOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Display mode */}
                        <div className="settings-section-label">מצב תצוגה</div>
                        <div className="settings-mode">
                            <button
                                className={`settings-mode-btn ${mode === 'dark' ? 'active' : ''}`}
                                onClick={() => setMode('dark')}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                                כהה
                            </button>
                            <button
                                className={`settings-mode-btn ${mode === 'light' ? 'active' : ''}`}
                                onClick={() => setMode('light')}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                                בהיר
                            </button>
                        </div>

                        <div className="settings-divider" />

                        {/* Netz countdown */}
                        <div className="settings-section-label">ספירה לאחור להנץ</div>
                        <div className="settings-row">
                            <label className="settings-toggle">
                                <input
                                    type="checkbox"
                                    checked={countdownEnabled}
                                    onChange={(e) => dispatch(setNetzCountdownEnabled(e.target.checked))}
                                />
                                <span className="settings-toggle-track">
                                    <span className="settings-toggle-thumb" />
                                </span>
                                <span className="settings-toggle-label">הפעל</span>
                            </label>

                            <select
                                className="settings-minutes"
                                aria-label="דקות לפני הנץ"
                                value={countdownMinutes}
                                disabled={!countdownEnabled}
                                onChange={(e) => dispatch(setNetzCountdownMinutes(Number(e.target.value)))}
                            >
                                {NETZ_COUNTDOWN_MINUTE_OPTIONS.map((m) => (
                                    <option key={m} value={m}>{m} דק׳</option>
                                ))}
                            </select>
                        </div>

                        <div className="settings-divider" />

                        {/* Color families */}
                        <div className="settings-section-label">צבע</div>
                        <div className="settings-colors">
                            {THEME_FAMILIES.map((fam) => (
                                <button
                                    key={fam.id}
                                    className={`settings-color ${fam.id === familyId ? 'active' : ''}`}
                                    onClick={() => setFamilyId(fam.id)}
                                    style={{ '--swatch': fam.swatch } as React.CSSProperties}
                                >
                                    <span className="settings-swatch" />
                                    <span className="settings-color-names">
                                        <span className="settings-color-he">{fam.nameHe}</span>
                                        <span className="settings-color-en">{fam.name}</span>
                                    </span>
                                    {fam.id === familyId && <span className="settings-color-dot" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function GearIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}
