import { IClockTitle } from "@shared/core/services/workers/handlers/models/shared-models";
import { TypedObjectMap } from "@shared/models/core";
import {
    TitlesKeys,
    TomorrowTitlesKeys,
} from '@shared/core/services/workers/handlers/models/titles-of-aiom';

export type DisplayTitleKey = TitlesKeys | TomorrowTitlesKeys;
export type GroupId = 'prayer' | 'study' | 'calendar';

export interface TitleMapping {
    group: GroupId;
    label: string;
    order: number;
    /** Pinned items are never truncated from the display and always sort first. */
    pinned?: boolean;
}

export const titleGroupMap: Partial<Record<DisplayTitleKey, TitleMapping>> = {
    // ─── Prayer group ───
    [TitlesKeys.Tachanun]: { group: 'prayer', label: 'תחנון', order: 10 },
    [TitlesKeys.MashivAruach]: { group: 'prayer', label: 'גשמים', order: 20 },
    [TitlesKeys.MoridAtal]: { group: 'prayer', label: 'גשמים', order: 20 },
    [TitlesKeys.BarechAlino]: { group: 'prayer', label: 'ברכת השנים', order: 30 },
    [TitlesKeys.Barechino]: { group: 'prayer', label: 'ברכת השנים', order: 30 },
    [TitlesKeys.YaalehVeYavo]: { group: 'prayer', label: 'יעלה ויבוא', order: 40 },
    [TitlesKeys.AlHaNissim]: { group: 'prayer', label: 'על הנסים', order: 50 },
    [TitlesKeys.Hallel]: { group: 'prayer', label: 'הלל', order: 60 },
    [TitlesKeys.Aneinu]: { group: 'prayer', label: 'עננו', order: 70 },
    [TitlesKeys.Nachem]: { group: 'prayer', label: 'נחם', order: 80 },
    [TitlesKeys.SefiratHaOmer]: { group: 'prayer', label: 'ספירת העומר', order: 90, pinned: true },
    [TitlesKeys.BirkatLevana]: { group: 'prayer', label: 'הלבנה', order: 100 },

    // ─── Study group ───
    [TitlesKeys.DafYomi]: { group: 'study', label: 'בבלי', order: 10 },
    [TitlesKeys.YerushalmiYomi]: { group: 'study', label: 'ירושלמי', order: 20 },
    [TitlesKeys.MishnaYomi]: { group: 'study', label: 'משנה', order: 30 },
    [TitlesKeys.Rambam]: { group: 'study', label: 'רמב״ם', order: 40 },
    [TitlesKeys.KitzurShulchanAruch]: { group: 'study', label: 'קיצור', order: 50 },
    [TitlesKeys.PirkeiAvot]: { group: 'study', label: 'אבות', order: 60 },

    // ─── Calendar group ───
    // Order prioritises the day's identity (chag/erev/fast) so it's never truncated.
    [TitlesKeys.ErevChag]: { group: 'calendar', label: 'ערב חג', order: 1, pinned: true },
    [TitlesKeys.Hag]: { group: 'calendar', label: 'חג', order: 2, pinned: true },
    [TitlesKeys.CholHamoed]: { group: 'calendar', label: 'חול המועד', order: 3, pinned: true },
    [TitlesKeys.ChanukahCandles]: { group: 'calendar', label: 'חנוכה', order: 4, pinned: true },
    [TitlesKeys.MinorHoliday]: { group: 'calendar', label: 'מועד קטן', order: 5, pinned: true },
    [TitlesKeys.Tzum]: { group: 'calendar', label: 'צום', order: 7, pinned: true },
    [TomorrowTitlesKeys.Tzum]: { group: 'calendar', label: 'צום מחר', order: 8 },
    [TitlesKeys.ErevRoshChodesh]: { group: 'calendar', label: 'ערב ראש חודש', order: 9, pinned: true },
    [TitlesKeys.RoshChodesh]: { group: 'calendar', label: 'ראש חודש', order: 10 },
    [TitlesKeys.Parsha]: { group: 'calendar', label: 'פרשה', order: 20 },
    [TitlesKeys.SpecialShabbat]: { group: 'calendar', label: 'שבת מיוחדת', order: 30 },
    [TitlesKeys.YomYerushalayim]: { group: 'calendar', label: 'יום ירושלים', order: 40 },
    [TitlesKeys.ShabbatMevarchim]: { group: 'calendar', label: 'שבת מברכים', order: 95 },
    [TitlesKeys.Molad]: { group: 'calendar', label: 'מולד', order: 100 },
    [TitlesKeys.MevarchimChodesh]: { group: 'calendar', label: 'מברכים חודש', order: 120 },
};

// Only two cards are shown. Calendar/day items are surfaced in the header
// (under the date) via getCalendarHeadline(), not as a card.
export const groups: { id: GroupId; title: string }[] = [
    { id: 'prayer', title: 'תפילה' },
    { id: 'study', title: 'לימוד יומי' },
];

export const excludeKeys: Partial<Record<string, boolean>> = {
    [TitlesKeys.HebrewDate]: true,
};

/** Maximum number of rows shown per card (pinned items don't count toward this). */
export const MAX_TITLES_PER_GROUP = 4;

/** Maximum number of calendar items joined into the header headline (pinned items guaranteed). */
export const MAX_CALENDAR_ITEMS = 6;

export interface SortableItem {
    value: string;
    label: string;
    order: number;
    streak: number;
    pinned: boolean;
}

/**
 * Sorts items: pinned first, then by streak ascending, then by order ascending.
 */
export function sortItems(items: SortableItem[]): SortableItem[] {
    return items.sort(
        (a, b) =>
            Number(b.pinned) - Number(a.pinned) ||
            a.streak - b.streak ||
            a.order - b.order,
    );
}

/**
 * Truncates a sorted list: all pinned items are kept, then fills remaining
 * slots up to `max` with non-pinned items in their current order.
 */
export function truncateItems(sorted: SortableItem[], max: number): SortableItem[] {
    const pinned = sorted.filter((i) => i.pinned);
    const rest = sorted.filter((i) => !i.pinned);
    const remaining = Math.max(0, max - pinned.length);
    return [...pinned, ...rest.slice(0, remaining)];
}

/**
 * Returns the day's calendar/festival headline (holiday, parsha, rosh chodesh, …)
 * as a single string, ordered by importance then novelty, joined with " · ".
 * Rendered under the date in the header — not as a card.
 * Pinned items (chag, erev, tzum, etc.) are always included and never cut.
 */
export function getCalendarHeadline(titles: TypedObjectMap<IClockTitle>): string {
    const items: SortableItem[] = [];
    const seen = new Set<string>();
    Object.keys(titles ?? {}).forEach((key) => {
        if (excludeKeys[key]) return;
        const mapping = titleGroupMap[key as DisplayTitleKey];
        if (!mapping || mapping.group !== 'calendar') return;
        const titleObj = titles[key];
        if (!titleObj?.title) return;
        // De-duplicate identical text (e.g. ModernHoliday + YomYerushalayim same text)
        if (seen.has(titleObj.title)) return;
        seen.add(titleObj.title);
        items.push({
            value: titleObj.title,
            label: mapping.label,
            order: mapping.order,
            streak: titleObj.streak ?? 99,
            pinned: mapping.pinned ?? false,
        });
    });
    return truncateItems(sortItems(items), MAX_CALENDAR_ITEMS)
        .map((i) => i.value)
        .join(' · ');
}

/**
 * Groups, sorts, and truncates titles into per-group arrays.
 * Also applies the Tachanun suppression rule.
 */
export function groupTitles(titles: TypedObjectMap<IClockTitle>): Record<GroupId, SortableItem[]> {
    const grouped: Record<GroupId, SortableItem[]> = {
        prayer: [],
        study: [],
        calendar: [],
    };

    Object.keys(titles ?? {}).forEach((key) => {
        if (excludeKeys[key]) return;

        // "אין אומרים תחנון" is obvious on Shabbat / Yom Tov / Chol HaMoed — hide it.
        if (key === TitlesKeys.Tachanun) {
            const obviousNoTachanun = [TitlesKeys.Parsha, TitlesKeys.Hag, TitlesKeys.CholHamoed]
                .some((k) => !!titles[k]?.title);
            if (obviousNoTachanun) return;
        }

        const mapping = titleGroupMap[key as DisplayTitleKey];
        if (!mapping) return;

        const titleObj = titles[key];
        if (!titleObj?.title) return;

        grouped[mapping.group].push({
            label: mapping.label,
            value: titleObj.title,
            order: mapping.order,
            // Missing streak (e.g. ranking disabled) is treated as "old" so it never jumps to the top.
            streak: titleObj.streak ?? 99,
            pinned: mapping.pinned ?? false,
        });
    });

    // Sort and truncate each group
    for (const group of Object.keys(grouped) as GroupId[]) {
        grouped[group] = truncateItems(sortItems(grouped[group]), MAX_TITLES_PER_GROUP);
    }

    return grouped;
}
