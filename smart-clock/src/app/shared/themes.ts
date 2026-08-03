// Theme system: 4 color families, each with dark + light variants.
// Ported from the "Redesign for Clean Aesthetic" reference and mapped onto
// smart-clock's existing CSS custom properties (see theme.scss).

export type ThemeMode = 'dark' | 'light';

export interface ThemeFamilyMeta {
    id: string;
    name: string;    // English label in the menu
    nameHe: string;  // Hebrew label in the menu
    swatch: string;  // flat swatch color shown in the menu
}

interface ThemeVariant {
    bg: string;
    surface: string;
    surfaceHeader: string;
    border: string;
    borderActive: string;
    accent: string;
    accentGlow: string;
    accentMuted: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    timeColor: string;
    divider: string;
    cardActive: string;
    panelBg: string;
}

export const THEME_FAMILIES: ThemeFamilyMeta[] = [
    { id: 'blue',   name: 'Blue',   nameHe: 'כחול', swatch: '#34d399' },
    { id: 'purple', name: 'Purple', nameHe: 'סגול', swatch: '#a78bfa' },
    { id: 'orange', name: 'Orange', nameHe: 'כתום', swatch: '#fb923c' },
    { id: 'red',    name: 'Red',    nameHe: 'אדום',    swatch: '#fb7185' },
    { id: 'teal',   name: 'Teal',   nameHe: 'טורקיז',  swatch: '#2dd4bf' },
    { id: 'cyan',   name: 'Cyan',   nameHe: 'תכלת',    swatch: '#22d3ee' },
    { id: 'green',  name: 'Green',  nameHe: 'ירוק',    swatch: '#4ade80' },
    { id: 'pink',   name: 'Pink',   nameHe: 'ורוד',    swatch: '#f472b6' },
    { id: 'indigo', name: 'Indigo', nameHe: 'אינדיגו', swatch: '#818cf8' },
    { id: 'amber',  name: 'Amber',  nameHe: 'ענבר',    swatch: '#fbbf24' },
    { id: 'slate',  name: 'Slate',  nameHe: 'אפור',    swatch: '#94a3b8' },
];

const VARIANTS: Record<string, { dark: ThemeVariant; light: ThemeVariant }> = {
    blue: {
        dark: {
            bg: '#080d18', surface: 'rgba(15,24,41,0.85)', surfaceHeader: 'rgba(52,211,153,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(52,211,153,0.38)',
            accent: '#34d399', accentGlow: 'rgba(52,211,153,0.3)', accentMuted: 'rgba(52,211,153,0.18)',
            textPrimary: '#e2e8f0', textSecondary: '#94a3b8', textMuted: '#475569',
            timeColor: '#60a5fa', divider: 'rgba(52,211,153,0.2)', cardActive: 'rgba(52,211,153,0.08)',
            panelBg: 'rgba(8,13,24,0.97)',
        },
        light: {
            bg: '#f0fdf8', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(16,185,129,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(16,185,129,0.4)',
            accent: '#059669', accentGlow: 'rgba(16,185,129,0.18)', accentMuted: 'rgba(16,185,129,0.14)',
            textPrimary: '#0f172a', textSecondary: '#1e293b', textMuted: '#94a3b8',
            timeColor: '#2563eb', divider: 'rgba(16,185,129,0.22)', cardActive: 'rgba(16,185,129,0.07)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    purple: {
        dark: {
            bg: '#0c0814', surface: 'rgba(20,12,32,0.88)', surfaceHeader: 'rgba(167,139,250,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(167,139,250,0.4)',
            accent: '#a78bfa', accentGlow: 'rgba(167,139,250,0.3)', accentMuted: 'rgba(167,139,250,0.18)',
            textPrimary: '#ede9fe', textSecondary: '#c4b5fd', textMuted: '#6b5fa0',
            timeColor: '#818cf8', divider: 'rgba(167,139,250,0.2)', cardActive: 'rgba(167,139,250,0.09)',
            panelBg: 'rgba(12,8,20,0.97)',
        },
        light: {
            bg: '#faf5ff', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(139,92,246,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(139,92,246,0.38)',
            accent: '#7c3aed', accentGlow: 'rgba(139,92,246,0.18)', accentMuted: 'rgba(139,92,246,0.12)',
            textPrimary: '#1e1b4b', textSecondary: '#312e81', textMuted: '#a5b4fc',
            timeColor: '#6d28d9', divider: 'rgba(139,92,246,0.2)', cardActive: 'rgba(139,92,246,0.07)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    orange: {
        dark: {
            bg: '#100c04', surface: 'rgba(24,16,6,0.88)', surfaceHeader: 'rgba(251,146,60,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(251,146,60,0.4)',
            accent: '#fb923c', accentGlow: 'rgba(251,146,60,0.3)', accentMuted: 'rgba(251,146,60,0.18)',
            textPrimary: '#fff7ed', textSecondary: '#fdba74', textMuted: '#92400e',
            timeColor: '#fcd34d', divider: 'rgba(251,146,60,0.2)', cardActive: 'rgba(251,146,60,0.08)',
            panelBg: 'rgba(16,12,4,0.97)',
        },
        light: {
            bg: '#fff7ed', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(234,88,12,0.05)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(234,88,12,0.38)',
            accent: '#ea580c', accentGlow: 'rgba(234,88,12,0.18)', accentMuted: 'rgba(234,88,12,0.12)',
            textPrimary: '#431407', textSecondary: '#7c2d12', textMuted: '#c2410c',
            timeColor: '#b45309', divider: 'rgba(234,88,12,0.2)', cardActive: 'rgba(234,88,12,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    red: {
        dark: {
            bg: '#0f0608', surface: 'rgba(22,8,10,0.88)', surfaceHeader: 'rgba(251,113,133,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(251,113,133,0.4)',
            accent: '#fb7185', accentGlow: 'rgba(251,113,133,0.3)', accentMuted: 'rgba(251,113,133,0.18)',
            textPrimary: '#fff1f2', textSecondary: '#fda4af', textMuted: '#9f1239',
            timeColor: '#f87171', divider: 'rgba(251,113,133,0.2)', cardActive: 'rgba(251,113,133,0.08)',
            panelBg: 'rgba(15,6,8,0.97)',
        },
        light: {
            bg: '#fff1f2', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(225,29,72,0.05)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(225,29,72,0.36)',
            accent: '#e11d48', accentGlow: 'rgba(225,29,72,0.16)', accentMuted: 'rgba(225,29,72,0.12)',
            textPrimary: '#4c0519', textSecondary: '#881337', textMuted: '#e11d48',
            timeColor: '#be123c', divider: 'rgba(225,29,72,0.2)', cardActive: 'rgba(225,29,72,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    teal: {
        dark: {
            bg: '#04120f', surface: 'rgba(6,24,22,0.88)', surfaceHeader: 'rgba(45,212,191,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(45,212,191,0.4)',
            accent: '#2dd4bf', accentGlow: 'rgba(45,212,191,0.3)', accentMuted: 'rgba(45,212,191,0.18)',
            textPrimary: '#f0fdfa', textSecondary: '#5eead4', textMuted: '#115e59',
            timeColor: '#22d3ee', divider: 'rgba(45,212,191,0.2)', cardActive: 'rgba(45,212,191,0.08)',
            panelBg: 'rgba(4,18,15,0.97)',
        },
        light: {
            bg: '#f0fdfa', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(13,148,136,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(13,148,136,0.38)',
            accent: '#0d9488', accentGlow: 'rgba(13,148,136,0.18)', accentMuted: 'rgba(13,148,136,0.12)',
            textPrimary: '#042f2e', textSecondary: '#134e4a', textMuted: '#5eead4',
            timeColor: '#0891b2', divider: 'rgba(13,148,136,0.2)', cardActive: 'rgba(13,148,136,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    cyan: {
        dark: {
            bg: '#04121a', surface: 'rgba(6,22,30,0.88)', surfaceHeader: 'rgba(34,211,238,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(34,211,238,0.4)',
            accent: '#22d3ee', accentGlow: 'rgba(34,211,238,0.3)', accentMuted: 'rgba(34,211,238,0.18)',
            textPrimary: '#ecfeff', textSecondary: '#67e8f9', textMuted: '#155e75',
            timeColor: '#38bdf8', divider: 'rgba(34,211,238,0.2)', cardActive: 'rgba(34,211,238,0.08)',
            panelBg: 'rgba(4,18,26,0.97)',
        },
        light: {
            bg: '#ecfeff', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(8,145,178,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(8,145,178,0.38)',
            accent: '#0891b2', accentGlow: 'rgba(8,145,178,0.18)', accentMuted: 'rgba(8,145,178,0.12)',
            textPrimary: '#083344', textSecondary: '#164e63', textMuted: '#67e8f9',
            timeColor: '#0284c7', divider: 'rgba(8,145,178,0.2)', cardActive: 'rgba(8,145,178,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    green: {
        dark: {
            bg: '#05120a', surface: 'rgba(8,24,14,0.88)', surfaceHeader: 'rgba(74,222,128,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(74,222,128,0.4)',
            accent: '#4ade80', accentGlow: 'rgba(74,222,128,0.3)', accentMuted: 'rgba(74,222,128,0.18)',
            textPrimary: '#f0fdf4', textSecondary: '#86efac', textMuted: '#166534',
            timeColor: '#34d399', divider: 'rgba(74,222,128,0.2)', cardActive: 'rgba(74,222,128,0.08)',
            panelBg: 'rgba(5,18,10,0.97)',
        },
        light: {
            bg: '#f0fdf4', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(22,163,74,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(22,163,74,0.38)',
            accent: '#16a34a', accentGlow: 'rgba(22,163,74,0.18)', accentMuted: 'rgba(22,163,74,0.12)',
            textPrimary: '#052e16', textSecondary: '#14532d', textMuted: '#86efac',
            timeColor: '#059669', divider: 'rgba(22,163,74,0.2)', cardActive: 'rgba(22,163,74,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    pink: {
        dark: {
            bg: '#140811', surface: 'rgba(28,10,22,0.88)', surfaceHeader: 'rgba(244,114,182,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(244,114,182,0.4)',
            accent: '#f472b6', accentGlow: 'rgba(244,114,182,0.3)', accentMuted: 'rgba(244,114,182,0.18)',
            textPrimary: '#fdf2f8', textSecondary: '#f9a8d4', textMuted: '#9d174d',
            timeColor: '#e879f9', divider: 'rgba(244,114,182,0.2)', cardActive: 'rgba(244,114,182,0.08)',
            panelBg: 'rgba(20,8,17,0.97)',
        },
        light: {
            bg: '#fdf2f8', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(219,39,119,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(219,39,119,0.38)',
            accent: '#db2777', accentGlow: 'rgba(219,39,119,0.18)', accentMuted: 'rgba(219,39,119,0.12)',
            textPrimary: '#500724', textSecondary: '#831843', textMuted: '#f9a8d4',
            timeColor: '#c026d3', divider: 'rgba(219,39,119,0.2)', cardActive: 'rgba(219,39,119,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    indigo: {
        dark: {
            bg: '#08091a', surface: 'rgba(14,16,34,0.88)', surfaceHeader: 'rgba(129,140,248,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(129,140,248,0.4)',
            accent: '#818cf8', accentGlow: 'rgba(129,140,248,0.3)', accentMuted: 'rgba(129,140,248,0.18)',
            textPrimary: '#eef2ff', textSecondary: '#a5b4fc', textMuted: '#3730a3',
            timeColor: '#60a5fa', divider: 'rgba(129,140,248,0.2)', cardActive: 'rgba(129,140,248,0.08)',
            panelBg: 'rgba(8,9,26,0.97)',
        },
        light: {
            bg: '#eef2ff', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(79,70,229,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(79,70,229,0.38)',
            accent: '#4f46e5', accentGlow: 'rgba(79,70,229,0.18)', accentMuted: 'rgba(79,70,229,0.12)',
            textPrimary: '#1e1b4b', textSecondary: '#312e81', textMuted: '#a5b4fc',
            timeColor: '#2563eb', divider: 'rgba(79,70,229,0.2)', cardActive: 'rgba(79,70,229,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    amber: {
        dark: {
            bg: '#140f03', surface: 'rgba(28,20,6,0.88)', surfaceHeader: 'rgba(251,191,36,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(251,191,36,0.4)',
            accent: '#fbbf24', accentGlow: 'rgba(251,191,36,0.3)', accentMuted: 'rgba(251,191,36,0.18)',
            textPrimary: '#fffbeb', textSecondary: '#fcd34d', textMuted: '#92400e',
            timeColor: '#fb923c', divider: 'rgba(251,191,36,0.2)', cardActive: 'rgba(251,191,36,0.08)',
            panelBg: 'rgba(20,15,3,0.97)',
        },
        light: {
            bg: '#fffbeb', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(217,119,6,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(217,119,6,0.38)',
            accent: '#d97706', accentGlow: 'rgba(217,119,6,0.18)', accentMuted: 'rgba(217,119,6,0.12)',
            textPrimary: '#451a03', textSecondary: '#78350f', textMuted: '#fcd34d',
            timeColor: '#ea580c', divider: 'rgba(217,119,6,0.2)', cardActive: 'rgba(217,119,6,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
    slate: {
        dark: {
            bg: '#080a0f', surface: 'rgba(15,23,42,0.88)', surfaceHeader: 'rgba(148,163,184,0.05)',
            border: 'rgba(255,255,255,0.05)', borderActive: 'rgba(148,163,184,0.4)',
            accent: '#94a3b8', accentGlow: 'rgba(148,163,184,0.3)', accentMuted: 'rgba(148,163,184,0.18)',
            textPrimary: '#f8fafc', textSecondary: '#cbd5e1', textMuted: '#334155',
            timeColor: '#64748b', divider: 'rgba(148,163,184,0.2)', cardActive: 'rgba(148,163,184,0.08)',
            panelBg: 'rgba(8,10,15,0.97)',
        },
        light: {
            bg: '#f8fafc', surface: 'rgba(255,255,255,0.92)', surfaceHeader: 'rgba(71,85,105,0.06)',
            border: 'rgba(0,0,0,0.07)', borderActive: 'rgba(71,85,105,0.38)',
            accent: '#475569', accentGlow: 'rgba(71,85,105,0.18)', accentMuted: 'rgba(71,85,105,0.12)',
            textPrimary: '#0f172a', textSecondary: '#1e293b', textMuted: '#94a3b8',
            timeColor: '#334155', divider: 'rgba(71,85,105,0.2)', cardActive: 'rgba(71,85,105,0.06)',
            panelBg: 'rgba(255,255,255,0.98)',
        },
    },
};

/** Maps a theme variant onto smart-clock's CSS custom properties. */
function toCssVars(v: ThemeVariant, mode: ThemeMode): Record<string, string> {
    return {
        '--app-bg': v.bg,
        '--card-bg': v.surface,
        '--card-bg-strong': v.surface,
        '--card-border': v.border,
        '--card-border-hover': v.borderActive,
        '--card-row-divider': v.border,
        '--accent-emerald': v.accent,
        '--accent-emerald-dim': v.accentMuted,
        '--accent-emerald-glow': v.accentGlow,
        '--accent-emerald-subtle': v.surfaceHeader,
        '--accent-emerald-border': v.borderActive,
        '--zman-blue': v.timeColor,
        '--zman-blue-featured': v.timeColor,
        '--current-bg': v.cardActive,
        '--current-border': v.borderActive,
        '--current-glow': `radial-gradient(ellipse at 50% 120%, ${v.accentMuted} 0%, transparent 70%)`,
        '--text-primary': v.textPrimary,
        '--text-secondary': v.textSecondary,
        '--text-muted': v.textSecondary,
        '--text-dim': v.textMuted,
        '--text-faint': v.textMuted,
        '--divider-gradient': `linear-gradient(90deg, transparent, ${v.divider}, transparent)`,
        '--panel-bg': v.panelBg,
        // Calendar timeline
        '--cal-tefilla': v.timeColor,
        '--cal-shiur': v.accent,
        '--cal-event': mode === 'dark' ? '#fb923c' : '#c2410c',
        '--cal-grid-line': v.border,
        '--cal-block-bg': mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)',
        '--cal-now': v.accent,
        '--cal-now-glow': v.accentGlow,
    };
}

const STORAGE_KEY = 'smartclock-theme';

/** Applies the selected family + mode by setting CSS variables on :root, and persists it. */
export function applyTheme(familyId: string, mode: ThemeMode): void {
    const family = VARIANTS[familyId] ?? VARIANTS.blue;
    const variant = mode === 'dark' ? family.dark : family.light;
    const vars = toCssVars(variant, mode);
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, val]) => root.style.setProperty(k, val));
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ familyId, mode }));
    } catch {
        /* ignore storage errors (private mode, etc.) */
    }
}

/** Loads the saved theme, defaulting to blue/dark. */
export function loadTheme(): { familyId: string; mode: ThemeMode } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            const familyId = THEME_FAMILIES.some((f) => f.id === parsed.familyId) ? parsed.familyId : 'blue';
            const mode: ThemeMode = parsed.mode === 'light' ? 'light' : 'dark';
            return { familyId, mode };
        }
    } catch {
        /* ignore */
    }
    return { familyId: 'blue', mode: 'dark' };
}
