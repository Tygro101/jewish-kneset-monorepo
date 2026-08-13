import type { IClockTitle } from '@shared/core/services/workers/handlers/models/shared-models';
import type { TypedObjectMap } from '@shared/models/core';
import { groupTitles, groups, type SortableItem } from '../titles/titlesGrouping';

/** A single row in the info panel. */
export interface InfoRow {
  /** Category label (e.g. 'בבלי'). Omitted for prayer rows. */
  label?: string;
  /** The actual value text. */
  value: string;
}

/** One page of the rotating info panel. */
export interface InfoPage {
  group: 'prayer' | 'study';
  rows: InfoRow[];
}

export interface BuildInfoPagesOptions {
  rowsPerPage: number;
}

/**
 * Builds an ordered array of info pages from the current titles.
 * Prayer rows omit the label (the value is self-describing, e.g. 'אין אומרים תחנון במנחה').
 * Study rows keep the label ('בבלי', 'ירושלמי', 'משנה', 'רמב״ם').
 * Returns [] when there are no items to display.
 */
export function buildInfoPages(
  titles: TypedObjectMap<IClockTitle>,
  options: BuildInfoPagesOptions,
): InfoPage[] {
  const { rowsPerPage } = options;
  const grouped = groupTitles(titles);
  const pages: InfoPage[] = [];

  // Prayer group first, then study (matching the visual order).
  for (const group of groups) {
    if (group.id === 'calendar') continue; // calendar goes in the header headline
    const items: SortableItem[] = grouped[group.id];
    if (!items.length) continue;

    // Chunk into pages of rowsPerPage
    for (let i = 0; i < items.length; i += rowsPerPage) {
      const chunk = items.slice(i, i + rowsPerPage);
      const rows: InfoRow[] = chunk.map((item) => {
        if (group.id === 'prayer') {
          return { value: item.value };
        }
        return { label: item.label, value: item.value };
      });
      pages.push({ group: group.id as 'prayer' | 'study', rows });
    }
  }

  return pages;
}

/**
 * Stable signature of the page content. Changes when the day's titles change
 * (e.g. new Daf Yomi), which should reset the rotation cursor.
 */
export function pagesSignature(pages: InfoPage[]): string {
  return pages
    .map((p) => `${p.group}:${p.rows.map((r) => r.value).join(',')}`)
    .join('|');
}
