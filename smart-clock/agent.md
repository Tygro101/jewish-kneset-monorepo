# Smart-Clock Project Context

## Target Hardware
- 14-inch tablet, 16:10 aspect ratio (portrait: default `/` route)
- 16:9 TVs via `electron-container` (landscape: `#/tv` route, 1920×1080 / 1366×768)
- App runs in full-screen mode on both form factors
- Readability from a distance is critical — large fonts, high-contrast cards

## Display Goals
- Maximum **6 time cards** visible at any given moment (3×2 grid)
- Cards should be large and clearly readable from several meters away
- The grid MUST fit 100% of the viewport — no scrolling
- When fewer than 6 cards are active, the grid adapts (e.g. 2×2 or 3×1) to maximize card size

## Architecture
- Monorepo: `jewish-kneset-monorepo` (Vite + React + Redux Toolkit)
- Shared package: `@shared` resolves to `../shared/src` (via vite alias)
- Times come from `timesState` (Redux store), calculated via hebcal + suncalc in `ZmaniAiom`
- Titles (prayer/study/calendar additions) come from `titlesState` (Redux store) via `TitlesAiom`
- Theme system: 11 color families × 2 modes (dark/light), stored in localStorage

## Location
- Default city: Netivot Neve Sharon (`CitiesEnum.NETIVOT_NEVA_SHARON`)

## Time Sections System (3 periods)
The day is divided into 3 sections, each showing ≤6 time cards:

| Section | Boundary | Cards |
|---------|----------|-------|
| morning | midnight → ChatzotYom | ChatzotLailah*, Alot, Tallit, Netz, SofShema(+Gra), SofBirkot(+Gra) |
| midday | ChatzotYom → Shkiah+10min | ChatzotYom, MinchaGdola, MinchaKtana, Plag, Shkiah, NerotShabat** |
| evening | Shkiah+10min → midnight | Plag, Shkiah, TzetGeonim(+RT), TzetShabat**/TzetTzum**, ChatzotLailah |

\* ChatzotLailah dropped from morning after Netz + 1 hour  
\*\* Only when the time key exists in state (day-type detection via time presence)

### Important Timing Notes
- `ChatzotLailah` = `addDays(nadir, 1)` — it's the LAST timestamp of the day (~00:48 next day)
- `getClosestKeyIndex` is ORDER-INDEPENDENT (does not assume array is chronological)
- Section switching: morning→midday at ChatzotYom, midday→evening at Shkiah+10min
- Day-type detected from PRESENCE of time keys (NerotShabat, TzetShabat, TzetTzumKatan), not from titles

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
- `src/app/components/clock-view/times/timesSections.ts` — section definitions and selection logic
- `src/app/components/clock-view/times/timesSections.spec.ts` — section tests
- `src/app/components/clock-view/times/TimesContainerHooks.ts` — React hook (uses sections, order-independent closest-index)
- `src/app/components/clock-view/times/TimesContainerHooks.spec.ts` — hook tests
- `src/app/components/clock-view/times/TimesContainer.tsx` — renders the zmanim grid (adaptive cols/rows via CSS vars)
- `src/app/components/clock-view/times/TimesContainer.scss` — grid layout (variable-driven 3×2 max)
- `src/app/components/clock-view/titles/TitlesView.tsx` — prayer/study info cards + Tachanun suppression
- `src/app/shared/themes.ts` — 11-family theme system
- `shared/src/core/services/workers/handlers/models/titles-of-aiom.ts` — calculates Tachanun, holidays, etc.
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
