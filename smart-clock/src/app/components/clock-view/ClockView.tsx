import { useRef, useEffect } from 'react';
import { useDailyRecalc } from '../../hooks/useDailyRecalc';
import { useFitToScreen } from '../../hooks/useFitToScreen';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getTimesSelector } from '../store/times/timesSelectors';
import { getConfigDataSelector } from '../store/config/configSelectors';
import { calculateTimes } from '../store/times/timesSlice';
import { resolveCity } from '@shared/core/schedule/zmanim-anchors';
import { calculateTitles } from '../store/titles/titlesSlice';
import { getTitlesSelector } from '../store/titles/titlesSelectors';
import { SettingsMenu } from '../settings/SettingsMenu';
import { DashboardShell } from './DashboardShell';
import { DashboardHeader } from './DashboardHeader';
import { DashboardBody } from './DashboardBody';
import { now } from '../../debug/clock';
import './ClockView.scss';

export interface ClockViewProps {
  /** When provided, replaces the default DashboardBody (info cards + zmanim). */
  bodyOverride?: React.ReactNode;
}

export const ClockView = ({ bodyOverride }: ClockViewProps = {}) => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const titles = useAppSelector(getTitlesSelector);
    const config = useAppSelector(getConfigDataSelector);
    const rootRef = useRef<HTMLDivElement>(null);
    const city = resolveCity(config?.tenant?.location);

    useFitToScreen(rootRef, [times, titles], { cssVar: '--fit-scale' });

    useDailyRecalc(() => {
        dispatch(calculateTimes({ date: now(), location: city }));
        dispatch(calculateTitles({ date: now(), location: city }));
    });

    // Recalc when the city changes after config loads.
    const lastCity = useRef<string | null>(null);
    useEffect(() => {
        if (lastCity.current !== null && lastCity.current !== city) {
            dispatch(calculateTimes({ date: now(), location: city }));
            dispatch(calculateTitles({ date: now(), location: city }));
        }
        lastCity.current = city;
    }, [dispatch, city]);

    return (
        <div className="clock-app" ref={rootRef}>
            <div className="ambient-glow" />
            <SettingsMenu />
            <DashboardShell>
                <DashboardHeader titles={titles} />
                {bodyOverride ?? <DashboardBody titles={titles} times={times} />}
            </DashboardShell>
        </div>
    );
};
