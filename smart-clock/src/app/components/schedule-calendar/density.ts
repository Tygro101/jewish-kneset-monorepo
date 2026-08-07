/** Visual density tiers for the calendar timeline. */
export type CalendarDensity = 'comfortable' | 'compact' | 'minimal';

/** Determines density from the number of visible day columns. */
export function densityForColumns(columns: number): CalendarDensity {
  if (columns <= 3) return 'comfortable'; // start+end pills, title, subtitle
  if (columns <= 5) return 'compact';     // start+end pills, title only
  return 'minimal';                       // start pill + title only
}

/** Block content variant based on event duration and overall density. */
export type BlockVariant = 'full' | 'standard' | 'tight';

export function blockVariantFor(durationMin: number, density: CalendarDensity): BlockVariant {
  if (density === 'minimal' || durationMin < 25) return 'tight';
  if (density === 'compact' || durationMin < 45) return 'standard';
  return 'full';
}

/**
 * Short blocks lay their start/end pills side by side so the pair costs one
 * text line instead of two. Keeps both times visible when the block is capped
 * by the next event's start.
 */
export function pillsInlineFor(durationMin: number): boolean {
  return durationMin < 45;
}
