import { useRef } from 'react';
import { useDailyRecalc } from '../../hooks/useDailyRecalc';
import { useFitToScreen } from '../../hooks/useFitToScreen';
import { ClockContainer } from "./clock/ClockContainer";
import './ClockView.scss';
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getTimesSelector } from "../store/times/timesSelectors";
import { calculateTimes } from "../store/times/timesSlice";
import { CitiesEnum, IClockTitle } from "@shared/core/services/workers/handlers/models/shared-models";
import { calculateTitles } from "../store/titles/titlesSlice";
import { getTitlesSelector } from "../store/titles/titlesSelectors";
import { TimesContainer } from "./times/TimesContainer";
import { TitlesKeys } from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import { TitlesContainer, getCalendarHeadline } from "./titles/TitlesView";
import { SettingsMenu } from "../settings/SettingsMenu";

export const ClockView = () => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const titles = useAppSelector(getTitlesSelector);
    const rootRef = useRef<HTMLDivElement>(null);

    // Fit-guard: shrinks --ui-scale only when content overflows on this tablet/day.
    useFitToScreen(rootRef, [times, titles]);

    // Recalculate zmanim/titles on mount, at each midnight, and on visibility restore.
    useDailyRecalc(() => {
        dispatch(calculateTimes({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
        dispatch(calculateTitles({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
    });

    const time = new Date();
    const hebrewDate = (titles[TitlesKeys.HebrewDate] as IClockTitle)?.title ?? '';
    const calendarHeadline = getCalendarHeadline(titles);
    const gregorianDate = time.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="clock-app" ref={rootRef}>
            {/* Ambient glow */}
            <div className="ambient-glow" />

            {/* Settings (theme) gear — top-right */}
            <SettingsMenu />

            {/* Header: Clock + Date */}
            <header className="header-section">
                <div className="clock-wrapper">
                    <ClockContainer />
                </div>
                <div className="date-block">
                    <div className="date-hebrew">{hebrewDate}</div>
                    {calendarHeadline && (
                        <div className="date-calendar">{calendarHeadline}</div>
                    )}
                    <div className="date-gregorian">{gregorianDate}</div>
                </div>
                <div className="divider" />
            </header>

            {/* Info Cards: תפילה / לימוד יומי */}
            <section className="info-section">
                <TitlesContainer titles={titles} />
            </section>

            {/* Zmanim */}
            <section className="zmanim-section">
                <div className="zmanim-header">
                    <span className="zmanim-title">זמני היום</span>
                </div>
                <TimesContainer times={times} />
            </section>

        </div>
    );
};
