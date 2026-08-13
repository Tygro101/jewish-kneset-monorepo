import { describe, it, expect } from 'vitest';
import { buildInfoPages, pagesSignature } from './infoPages';
import { TitlesKeys } from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import type { IClockTitle } from '@shared/core/services/workers/handlers/models/shared-models';

function title(text: string, streak = 99): IClockTitle {
  return { title: text, streak } as IClockTitle;
}

const sampleTitles = {
  [TitlesKeys.Tachanun]: title('אין אומרים תחנון במנחה'),
  [TitlesKeys.MashivAruach]: title('מוריד הטל'),
  [TitlesKeys.BarechAlino]: title('ברכנו'),
  [TitlesKeys.DafYomi]: title('חולין דף ק״ד'),
  [TitlesKeys.YerushalmiYomi]: title('בבא בתרא דף כ'),
  [TitlesKeys.MishnaYomi]: title('כלים כ״ד:ט׳-י׳'),
  [TitlesKeys.Rambam]: title('הלכות קידוש החודש פרק יג'),
} as Record<string, IClockTitle>;

describe('buildInfoPages', () => {
  it('chunks into pages of rowsPerPage', () => {
    const pages = buildInfoPages(sampleTitles, { rowsPerPage: 2 });
    // 3 prayer + 4 study = 7 items
    // prayer: 2 pages (2, 1), study: 2 pages (2, 2)
    expect(pages).toHaveLength(4);
    expect(pages[0].rows).toHaveLength(2);
    expect(pages[1].rows).toHaveLength(1);
    expect(pages[2].rows).toHaveLength(2);
    expect(pages[3].rows).toHaveLength(2);
  });

  it('prayer rows have no label', () => {
    const pages = buildInfoPages(sampleTitles, { rowsPerPage: 2 });
    const prayerPages = pages.filter((p) => p.group === 'prayer');
    for (const page of prayerPages) {
      for (const row of page.rows) {
        expect(row.label).toBeUndefined();
      }
    }
  });

  it('study rows have a label', () => {
    const pages = buildInfoPages(sampleTitles, { rowsPerPage: 2 });
    const studyPages = pages.filter((p) => p.group === 'study');
    for (const page of studyPages) {
      for (const row of page.rows) {
        expect(row.label).toBeDefined();
        expect(row.label!.length).toBeGreaterThan(0);
      }
    }
  });

  it('returns empty array for empty titles', () => {
    expect(buildInfoPages({}, { rowsPerPage: 2 })).toEqual([]);
  });

  it('rowsPerPage=3 chunks accordingly', () => {
    const pages = buildInfoPages(sampleTitles, { rowsPerPage: 3 });
    // 3 prayer: 1 page (3). 4 study: 2 pages (3, 1)
    expect(pages).toHaveLength(3);
    expect(pages[0].rows).toHaveLength(3);
    expect(pages[1].rows).toHaveLength(3);
    expect(pages[2].rows).toHaveLength(1);
  });
});

describe('pagesSignature', () => {
  it('changes when content changes', () => {
    const pages1 = buildInfoPages(sampleTitles, { rowsPerPage: 2 });
    const modified = { ...sampleTitles, [TitlesKeys.DafYomi]: title('חולין דף ק״ה') };
    const pages2 = buildInfoPages(modified as Record<string, IClockTitle>, { rowsPerPage: 2 });
    expect(pagesSignature(pages1)).not.toBe(pagesSignature(pages2));
  });

  it('is stable for same content', () => {
    const pages = buildInfoPages(sampleTitles, { rowsPerPage: 2 });
    expect(pagesSignature(pages)).toBe(pagesSignature(pages));
  });
});
