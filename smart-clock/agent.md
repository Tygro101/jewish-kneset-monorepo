# Smart-Clock Project Context

## Target Hardware
- 14-inch tablet, 16:10 aspect ratio (portrait: default `/` route)
- 16:9 TVs via `electron-container` (landscape: `#/tv` route, 1920×1080 / 1366×768)
- App runs in full-screen mode on both form factors
- Readability from a distance is critical — large fonts, high-contrast cards

## Display Goals
- **4 or 6 time cards** per screen, CMS-configurable with an on-screen fallback (default: tablet 4, TV 6)
- Cards should be large and clearly readable from several meters away (4-card mode maximizes digit size for 6–8 m legibility)
- The grid MUST fit 100% of the viewport — no scrolling
- When fewer cards are active, the grid adapts (e.g. 2×2 or 3×1) to maximize card size
- In 4-card mode, seconds suffix and מ"א/גר"א secondary additions are dropped for larger digits
- Info panel: full-width rotating pages (2 rows/page tablet, 3 rows/page TV) replace the old two-column cards
- Zmanim use a rolling window (stride = count/2) over one chronological sequence — NOT 3 fixed sections
- Typography driven by `--zman-name-size`, `--zman-main-size`, `--zman-addition-ratio` on `.zman-card`; overrides per form factor in the respective SCSS file

## Architecture
- Monorepo: `jewish-kneset-monorepo` (Vite + React + Redux Toolkit)
- Shared package: `@shared` resolves to `../shared/src` (via vite alias)
- Times come from `timesState` (Redux store), calculated via hebcal + suncalc in `ZmaniAiom`
- Titles (prayer/study/calendar additions) come from `titlesState` (Redux store) via `TitlesAiom`
- Theme system: 11 color families × 2 modes (dark/light), stored in localStorage

## Location
- Default city: Netivot Neve Sharon (`CitiesEnum.NETIVOT_NEVA_SHARON`)

## Rolling Zmanim Window

A single chronological sequence of all zmanim, displayed via a sliding window:

One chronological sequence per mode, with a sliding window (`size = count`, `stride = count / 2`).

**Algorithm:**
1. Build a full chronological sequence of all zmanim present in today's state
2. Leading ChatzotLailah carries `dayOffset: -1` (effective ms shifted back 1 day so it sorts first)
3. Day-type keys (NerotShabat, TzetShabat, TzetTzumKatan, TzetCochavimRabinoTam) absent from state are omitted — presence = day-type detection
4. `upcoming` = first entry with `ms > now - 10min` (the marked-time grace)
5. Window start = `(floor(upcoming / stride) - 1) * stride`, clamped to `[0, len - size]`
6. Block advances when the last card in the current block has passed + 10min

**4-card mode** (default on tablet): every zman gets its own card (no additions). No seconds suffix.  
**6-card mode** (default on TV): מ"א/גר"א pairs collapsed onto one card (main + addition).

| 4-card windows (weekday) | cards shown |
|---|---|
| 0 | ChatzotLailah, Alot, Tallit, Netz |
| 2 | Tallit, Netz, SofShemaMagenAvraham, SofShemaGra |
| 4 | SofShemaMagenAvraham, SofShemaGra, SofBirkotMagenAvraham, SofBirkotGra |
| 6 | SofBirkotMagenAvraham, SofBirkotGra, ChatzotYom, MinchaGdola |
| … | continues to evening ChatzotLailah |

### Important Timing Notes
- `ChatzotLailah` = `addDays(nadir, 1)` — it's the LAST timestamp of the day (~00:48 next day)
- Leading ChatzotLailah in the sequence uses `dayOffset: -1` so its effective ms is last night's
- The 10-minute grace (MARKED_TIME_GRACE_MS) both keeps the just-passed zman highlighted AND delays the window advance
- Day-type detected from PRESENCE of time keys (NerotShabat, TzetShabat, TzetTzumKatan), not from titles

### Zman Name Resolution
- `resolveZmanName()` picks between `generalName`, `name`, and `shortName`
- `generalName` is used only when the card has additions (paired card) — otherwise identical labels would appear on adjacent cards
- Falls back to `shortName` when the preferred name exceeds the per-mode character limit (14 chars for 4-card, 12 for 6-card)
- All existing `shortName` values are ≤ 12 chars — no extra-short map needed

### Zmanim Typography Contract
Three CSS custom properties on `.zman-card` drive all font sizes:
- `--zman-name-size` — the Hebrew zman label
- `--zman-main-size` — the H:mm digits
- `--zman-addition-ratio` — secondary time as a fraction of main

**RULE:** a `clamp()` MINIMUM larger than the geometrically-fitting size produces CLIPPING, not shrinking. Keep floors low.

Overrides per form factor:
- Tablet baseline: `TimesContainer.scss`
- Tablet 4-card: `[data-zman-count="4"]` selector in same file (tighter gap/padding + raised multipliers)
- TV 6-card: `.tv-app .zmanim-grid .zman-card` in `TvClockView.scss`
- TV 4-card: `.tv-app .zmanim-grid[data-zman-count="4"] .zman-card` in same file

## Key Files
- `src/app/routing/routes.ts` — `parseRoute()`, `AppRoute` type, `TV_HASH`
- `src/app/routing/useRoute.ts` — `useRoute()` hook (hashchange subscription)
- `src/app/components/clock-view/ClockView.tsx` — tablet/portrait composition layout
- `src/app/components/tv-view/TvClockView.tsx` — landscape/TV composition layout (rail + main)
- `src/app/components/tv-view/TvClockView.scss` — two-column grid + `.tv-app`-scoped leaf overrides
- `src/app/components/schedule-calendar/ScheduleCalendar.tsx` — container, reads store, renders ScheduleTimeline
- `src/app/components/schedule-calendar/ScheduleTimeline.tsx` — presentational, N day columns
- `src/app/components/schedule-calendar/resolveDaysAhead.ts` — CMS value → clamped daysAhead
- `src/app/components/schedule-calendar/useScheduleDays.ts` — memoized buildTimelineDays + hasScheduleInRange
- `src/app/components/clock-view/times/zmanimSequence.ts` — chronological sequence + rolling window algorithm
- `src/app/components/clock-view/times/zmanDisplayName.ts` — character-limit-driven name resolution
- `src/app/components/clock-view/times/TimesContainerHooks.ts` — React hook (drives the window, re-evaluates every 30s)
- `src/app/components/clock-view/times/TimesContainer.tsx` — renders the zmanim grid (adaptive cols/rows via CSS vars)
- `src/app/components/clock-view/times/TimesContainer.scss` — grid layout, CSS variable contract, tablet 4-card overrides
- `src/app/components/clock-view/times/resolveZmanimCount.ts` — CMS value → clamped zmanimCount (mirrors resolveDaysAhead)
- `src/app/components/clock-view/times/useDeviceZmanimCount.ts` — device-local zmanim count by route
- `src/app/components/clock-view/titles/titlesGrouping.ts` — pure grouping/sorting/truncation logic, getCalendarHeadline, groupTitles
- `src/app/components/clock-view/info/infoPages.ts` — buildInfoPages (paginated rows), pagesSignature
- `src/app/components/clock-view/info/infoRotationCursor.ts` — module-level singleton cursor (survives unmount)
- `src/app/components/clock-view/info/useInfoRotation.ts` — timer-driven page advancement hook (12s, 350ms fade, paused flag)
- `src/app/components/clock-view/info/InfoPanel.tsx` — presentational: one page of info rows
- `src/app/components/clock-view/info/InfoPanelRotator.tsx` — container: builds pages, drives rotation, renders InfoPanel
- `src/app/components/clock-view/headerDateLines.ts` — pure buildHeaderDateLines(date, hebrewDate) → { primary, secondary }
- `shared/src/core/display/contrast.ts` — WCAG colour contrast utilities (parseColor, blendOver, relativeLuminance, contrastRatio)
- `shared/src/core/display/zmanim-count.ts` — zmanim count types/resolution (MIRROR: kneset-cms/src/lib/zmanimCount.ts)
- `src/app/shared/themes.ts` — 11-family theme system
- `shared/src/core/services/workers/handlers/models/titles-of-aiom.ts` — calculates Tachanun, holidays, ערב ראש חודש, etc.
- `shared/src/core/services/workers/handlers/models/zmani-aiom.ts` — calculates all zmanim for the day

## Routing
- Hash-based (`#/tv`): no react-router, no GitHub Pages rewrite, offline-safe
- `main.tsx` uses `useRoute()` → selects `ClockView` or `TvClockView` as `Dashboard`
- Both overlays (`PresentationView`, `MessagesView`) are `position: fixed` and work over either layout
- `electron-container` appends `#/tv` to the base URL via `resolveTargetUrl()`

## TV Layout Architecture (TvClockView)
- Two-column grid: `.tv-dashboard` (right in RTL, ~42%) + `.tv-calendar` (left, ~58%)
- Dashboard column: `DashboardHeader` (clock + dates + divider) + `DashboardBody` (info cards + zmanim 3×2)
- Calendar column: `ScheduleCalendar` container → `ScheduleTimeline` presentational (N day columns)
- Calendar is **permanent on TV** — not part of the display rotation
- `.tv-app--no-calendar` collapses to a single column when `weeklySchedule` is empty
- **Container queries:** `.tv-calendar` declares `container-type: size; container-name: calendar`; `.info-section` → `cards`; `.zmanim-section` → `zmanim`. Leaf cq-unit typography resolves against these.
- Typography adjustments for TV are done only via `.tv-app .leaf-class` selectors in `TvClockView.scss` — never edit component SCSS for TV purposes.
- Fit-guard: `ceil: 1.15, floor: 0.7` (tighter than tablet's `1.2 / 0.75`)
- Calendar timeline: **percentage-positioned** (no px/overflow); excluded from `data-fit-measure`

## Schedule Calendar Timeline
- **Domain logic:** `shared/src/core/schedule/` — types, time-utils, day-keys, day-context (hebcal), event-durations (prayer keyword rules), timeline-builder (overlap clipping), timeline-window (scale-to-fit %)
- **Presentational:** `smart-clock/src/app/components/schedule-calendar/` — ScheduleTimeline, DayColumn, HourGrid, EventBlock, TimePill, NowLine (no Redux, no domain math)
- **Container:** `ScheduleCalendar.tsx` (reads store), `useScheduleDays.ts`, `useNowMinutes.ts`, `resolveDaysAhead.ts`, `useDeviceDaysAhead.ts`
- **Theme vars:** `--cal-tefilla`, `--cal-shiur`, `--cal-event`, `--cal-grid-line`, `--cal-block-bg`, `--cal-now`, `--cal-now-glow`
- **Config additions:** `ScheduleEvent.endTime?`, `ScheduleEvent.durationMinutes?`, `ScheduleEvent.subtitle?`, `displaySettings.scheduleDaysAhead?` (`{ tv: 1–7 | 'screen', tablet: 1–3 | 'screen' }`; legacy plain number still read)
- **Duration fallbacks:** שחרית 60/120, מנחה 25/35, ערבית 20/40 (Shabbat/YT/ErevShabbat/ErevYT triggers)
- **Settings:** `scheduleBlocked` toggle removes calendar from tablet rotation; no effect on TV
- **Days-ahead precedence:** CMS number → on-screen setting (`settings.scheduleDaysAheadTv/Tablet`, localStorage) → code default (TV 6, tablet 2); clamped in `shared/core/schedule/days-ahead.ts`
- **Density tiers:** 1–3 cols = comfortable (pills+title+subtitle), 4–5 = compact (pills+title), 6–7 = minimal (start pill+title)
- **Overlap rule:** if A.end > B.start, clip A.end to B.start (`clipped: true`)

## Important Behaviors
- **Tachanun suppression:** Hebcal emits "אין אומרים תחנון" on Shabbat/YT/CholHaMoed, but TitlesView.tsx hides it on those days since it's obvious. Shown only on "surprising" no-tachanun days (Rosh Chodesh, Lag BaOmer, etc.)
- **NerotShabat:** Only calculated (and emitted to state) when hebcal's `LIGHT_CANDLES` flag is set
- **TzetShabat:** Only calculated when `LIGHT_CANDLES_TZEIS` flag is set
- **TzetTzumKatan:** Only calculated on `MINOR_FAST` or `MAJOR_FAST` days
- **ערב ראש חודש:** Hebcal emits no event for erev Rosh Chodesh (flags.EREV covers holidays only). Derived from tomorrow's `ROSH_CHODESH` flag in `TitlesAiom.calculateTitles()`, suppressed when today IS Rosh Chodesh. 29 Elul self-excludes because hebcal does not flag 1 Tishrei as Rosh Chodesh. No date/month arithmetic used — compliant with the hebcal-only rule.

## Hebrew Calendar & Jewish Date Data — Use @hebcal/core exclusively

ALL Hebrew calendar logic, Jewish date computations, and holiday/event data MUST come
from the `@hebcal/core` library (and its companion `@hebcal/learning`). Never reimplement
halachic rules, holiday lists, or date arithmetic by hand.

### What hebcal provides (use these, do not reinvent):
- `HebrewCalendar.calendar(options)` — generate events for a date range
- `HebrewCalendar.hallel(hdate, il)` — returns 0/1/2 (none/half/whole)
- `HebrewCalendar.tachanun(hdate, il)` — returns `{shacharit, mincha, allCongs}`
- `HebrewCalendar.getHolidaysOnDate(hdate, il)` — holiday events for a single day
- `HebrewCalendar.eruvTavshilin(date, il)` — boolean
- `HolidayEvent.basename()` — strips Erev/day-numbers/qualifiers from event names
- `holidayDesc` constants — stable English keys for every holiday (use instead of string literals)
- `flags.*` — bitmask constants (CHAG, EREV, CHOL_HAMOED, MINOR_HOLIDAY, MINOR_FAST, MAJOR_FAST, CHANUKAH_CANDLES, MODERN_HOLIDAY, ROSH_CHODESH, OMER_COUNT, SHABBAT_MEVARCHIM, MOLAD, PARSHA_HASHAVUA, SPECIAL_SHABBAT, etc.)
- `event.renderBrief('he-x-NoNikud')` — Hebrew text without nikud (for display)
- `event.render('he-x-NoNikud')` — full Hebrew rendering
- `gematriya(n)` — number to Hebrew gematria string
- `HDate` — Hebrew date construction and conversion
- `DailyLearning.lookup(name, hdate, il)` — Daf Yomi, Mishna Yomi, Rambam, etc.
- `isAveilut(hdate)` — mourning period detection
- `isAssurBemlacha(date, location, useElevation)` — Shabbat/YomTov melacha check
- `isFastDay(hdate, il)` — fast day detection

### Rules:
1. Never hard-code holiday names in Hebrew or English — use `holidayDesc.*` constants or match via `flags.*` bitmasks
2. Never write month/day arithmetic to determine if "today is X holiday" — use `getHolidaysOnDate()` or check event flags from `calendar()`
3. Never hand-write Hallel/Tachanun logic — use the built-in methods
4. For Hebrew rendering, always use the `'he-x-NoNikud'` locale (nikud-stripped Hebrew)
5. Numbers that appear in titles (Omer count, Mishna chapter numbers) must use `gematriya()`, never Arabic digits
6. Calendar options: always use `il: true` (Israel schedule) from `DefaultOptions` in `shared/src/core/services/workers/handlers/constants/calendar.options.ts`
7. If hebcal has a known gap (e.g. Shmini Atzeret not matching `hallel()` for whole Hallel), add a targeted override with a comment explaining the gap — do not replace the whole function with hand-rolled logic

## Contrast System
- `shared/src/core/display/contrast.ts` provides WCAG 2.1 relative-luminance and contrast-ratio utilities
- `themes.contrast.spec.ts` enforces floors on all 22 theme variants (11 families × dark/light):
  - `textPrimary` ≥ 12:1 against card surface
  - `textSecondary`, `textMuted`, `timeColor` ≥ 8:1
  - `accent` ≥ 6:1
- The card surface is the semi-transparent `v.surface` blended over `v.bg` (alpha compositing)
- Clock glow reduced to 18px / 0.25 alpha; ambient glow to 42vw — halos hurt distance legibility
- Card borders at 0.14 alpha; row dividers at 0.08 — visible from 6 m

## Zmanim Count CMS Setting
- Pattern mirrors `scheduleDaysAhead` exactly (same shape: `{ tv: 4|6|'screen', tablet: 4|6|'screen' }`)
- `shared/src/core/display/zmanim-count.ts` ⇄ `kneset-cms/src/lib/zmanimCount.ts` (MIRROR)
- Precedence: CMS number → on-screen setting (localStorage) → code default (tv 6, tablet 4)
- On-screen control in SettingsMenu; greys out with "נקבע במערכת הניהול (CMS)" when locked

## Info Panel Rotation
- Full-width single panel replaces the two-column info cards
- Pages: prayer group first, then study, chunked by `rowsPerPage` (tablet 2, TV 3)
- Prayer rows omit the label (the value is self-describing); study rows keep the label
- Rotation: 12 s per page, 350 ms crossfade (opacity transition)
- **Persistent cursor:** module-level singleton (`infoRotationCursor.ts`) survives component unmount.
  When the display rotates to a message/PDF/schedule and back, the panel resumes at the next page.
- **Pause rule (`infoPaused`):** only passed in the presentation overlay branch (dashboard mounted but hidden).
  Messages and schedule branches unmount DashboardBody — cursor persistence handles those.
  TV messages branch does NOT pause (dashboard column stays visible).
- `pagesSignature` detects when the day's content changes and resets the cursor to 0.

## Legibility Reference (12.1" tablet, 16:10 portrait)
- CSS viewport ≈ 800 × 1280 px → 0.204 mm per CSS px
- Hebrew glyph height ≈ 0.55 em (Heebo), digit height ≈ 0.71 em (Nunito)
- 4-card zman time digits ≈ 17–24 mm → readable at 6–8 m
- 4-card zman names ≈ 7–10 mm → identifiable at 4–5 m (not full legibility at 10 m)
- Info panel values ≈ 7–10 mm → recognizable at 3–4 m
- Header primary line ≈ 7–8.5 mm → readable at ~3 m
- Clock digits ≈ 26 mm → readable at 9–10 m
- Honest limit: 6–10 m legibility of Hebrew zman names is not physically reachable on 12.1" — the TV serves that range
