# Smart-Clock Project Context

## Target Hardware
- 14-inch tablet, 16:10 aspect ratio
- App runs in full-screen landscape mode
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
- `src/app/components/clock-view/times/timesSections.ts` — section definitions and selection logic
- `src/app/components/clock-view/times/timesSections.spec.ts` — section tests
- `src/app/components/clock-view/times/TimesContainerHooks.ts` — React hook (uses sections, order-independent closest-index)
- `src/app/components/clock-view/times/TimesContainerHooks.spec.ts` — hook tests
- `src/app/components/clock-view/times/TimesContainer.tsx` — renders the zmanim grid (adaptive cols/rows via CSS vars)
- `src/app/components/clock-view/times/TimesContainer.scss` — grid layout (variable-driven 3×2 max)
- `src/app/components/clock-view/titles/TitlesView.tsx` — prayer/study info cards + Tachanun suppression
- `src/app/components/clock-view/ClockView.tsx` — main composition layout
- `src/app/shared/themes.ts` — 11-family theme system
- `shared/src/core/services/workers/handlers/models/titles-of-aiom.ts` — calculates Tachanun, holidays, etc.
- `shared/src/core/services/workers/handlers/models/zmani-aiom.ts` — calculates all zmanim for the day

## Important Behaviors
- **Tachanun suppression:** Hebcal emits "אין אומרים תחנון" on Shabbat/YT/CholHaMoed, but TitlesView.tsx hides it on those days since it's obvious. Shown only on "surprising" no-tachanun days (Rosh Chodesh, Lag BaOmer, etc.)
- **NerotShabat:** Only calculated (and emitted to state) when hebcal's `LIGHT_CANDLES` flag is set
- **TzetShabat:** Only calculated when `LIGHT_CANDLES_TZEIS` flag is set
- **TzetTzumKatan:** Only calculated on `MINOR_FAST` or `MAJOR_FAST` days
