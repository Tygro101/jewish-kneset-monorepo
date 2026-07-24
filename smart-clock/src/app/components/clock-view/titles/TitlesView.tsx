import { IClockTitle } from "@shared/core/services/workers/handlers/models/shared-models";
import { TypedObjectMap } from "@shared/models/core";
import {
    TitlesKeys,
    TomorrowTitlesKeys,
} from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import './TitlesView.scss';

export type TitlesProps = {
    titles: TypedObjectMap<IClockTitle>;
};

type DisplayTitleKey = TitlesKeys | TomorrowTitlesKeys;
type GroupId = 'prayer' | 'study' | 'calendar';

interface TitleMapping {
    group: GroupId;
    label: string;
    order: number;
}

const titleGroupMap: Partial<Record<DisplayTitleKey, TitleMapping>> = {
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
    [TitlesKeys.SefiratHaOmer]: { group: 'prayer', label: 'ספירת העומר', order: 90 },
    [TitlesKeys.BirkatLevana]: { group: 'prayer', label: 'הלבנה', order: 100 },

    [TitlesKeys.DafYomi]: { group: 'study', label: 'בבלי', order: 10 },
    [TitlesKeys.YerushalmiYomi]: { group: 'study', label: 'ירושלמי', order: 20 },
    [TitlesKeys.MishnaYomi]: { group: 'study', label: 'משנה', order: 30 },
    [TitlesKeys.Rambam]: { group: 'study', label: 'רמב״ם', order: 40 },
    [TitlesKeys.KitzurShulchanAruch]: { group: 'study', label: 'קיצור', order: 50 },
    [TitlesKeys.PirkeiAvot]: { group: 'study', label: 'אבות', order: 60 },

    [TitlesKeys.RoshChodesh]: { group: 'calendar', label: 'ראש חודש', order: 10 },
    [TitlesKeys.Parsha]: { group: 'calendar', label: 'פרשה', order: 20 },
    [TitlesKeys.SpecialShabbat]: { group: 'calendar', label: 'שבת מיוחדת', order: 30 },
    [TitlesKeys.MinorHoliday]: { group: 'calendar', label: 'מועד קטן', order: 40 },
    [TitlesKeys.YomYerushalayim]: { group: 'calendar', label: 'יום ירושלים', order: 50 },
    [TitlesKeys.Hag]: { group: 'calendar', label: 'חג', order: 60 },
    [TitlesKeys.CholHamoed]: { group: 'calendar', label: 'חול המועד', order: 70 },
    [TitlesKeys.ChanukahCandles]: { group: 'calendar', label: 'חנוכה', order: 80 },
    [TitlesKeys.Tzum]: { group: 'calendar', label: 'צום', order: 90 },
    [TomorrowTitlesKeys.Tzum]: { group: 'calendar', label: 'צום מחר', order: 91 },
    [TitlesKeys.Molad]: { group: 'calendar', label: 'מולד', order: 100 },
    [TitlesKeys.ShabbatMevarchim]: { group: 'calendar', label: 'שבת מברכים', order: 110 },
    [TitlesKeys.MevarchimChodesh]: { group: 'calendar', label: 'מברכים חודש', order: 120 },
};

// Only two cards are shown. Calendar/day items are surfaced in the header
// (under the date) via getCalendarHeadline(), not as a card.
const groups: { id: GroupId; title: string }[] = [
    { id: 'prayer', title: 'תפילה' },
    { id: 'study', title: 'לימוד יומי' },
];

const excludeKeys: Partial<Record<string, boolean>> = {
    [TitlesKeys.HebrewDate]: true,
};

/** Maximum number of rows shown per card. */
const MAX_TITLES_PER_GROUP = 4;

/** Maximum number of calendar items joined into the header headline. */
const MAX_CALENDAR_ITEMS = 4;

/**
 * Returns the day's calendar/festival headline (holiday, parsha, rosh chodesh, …)
 * as a single string, ordered by novelty then importance, joined with " · ".
 * Rendered under the date in the header — not as a card.
 */
export function getCalendarHeadline(titles: TypedObjectMap<IClockTitle>): string {
    const items: { value: string; order: number; streak: number }[] = [];
    Object.keys(titles ?? {}).forEach((key) => {
        if (excludeKeys[key]) return;
        const mapping = titleGroupMap[key as DisplayTitleKey];
        if (!mapping || mapping.group !== 'calendar') return;
        const titleObj = titles[key];
        if (!titleObj?.title) return;
        items.push({
            value: titleObj.title,
            order: mapping.order,
            streak: titleObj.streak ?? 99,
        });
    });
    return items
        .sort((a, b) => a.streak - b.streak || a.order - b.order)
        .slice(0, MAX_CALENDAR_ITEMS)
        .map((i) => i.value)
        .join(' · ');
}

export const TitlesContainer = (props: TitlesProps) => {
    const { titles } = props;
    const grouped: Record<GroupId, { label: string; value: string; order: number; streak: number }[]> = {
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
        });
    });

    return (
        <div className="info-cards" data-fit-measure>
            {groups.map((group) => {
                const items = grouped[group.id]
                    .sort((a, b) => a.streak - b.streak || a.order - b.order)
                    .slice(0, MAX_TITLES_PER_GROUP);
                if (!items.length) return null;

                return (
                    <div key={group.id} className="info-card">
                        <div className="info-card-header">
                            <span className="info-card-title">{group.title}</span>
                        </div>
                        <div className="info-card-body">
                            {items.map((item, i) => (
                                <div
                                    key={`${group.id}-${item.label}-${item.value}-${i}`}
                                    className={`info-card-row ${i < items.length - 1 ? 'has-border' : ''}`}
                                >
                                    <span className="info-card-label">{item.label}</span>
                                    <span className="info-card-divider" />
                                    <span className="info-card-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
