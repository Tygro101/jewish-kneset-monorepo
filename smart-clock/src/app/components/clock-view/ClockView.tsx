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
import { useDeviceZmanimCount } from './times/useDeviceZmanimCount';
import { resolveZmanimCount } from './times/resolveZmanimCount';
import { useRoute } from '../../routing/useRoute';
import { now } from '../../debug/clock';
import './ClockView.scss';

export interface ClockViewProps {
  /** When provided, replaces the default DashboardBody (info cards + zmanim). */
  bodyOverride?: React.ReactNode;
  /**
   * Pauses the info panel rotation — used when the dashboard stays mounted but
   * is hidden behind a presentation overlay.
   */
  infoPaused?: boolean;
}

export const ClockView = ({ bodyOverride, infoPaused }: ClockViewProps = {}) => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const titles = useAppSelector(getTitlesSelector);
    const config = useAppSelector(getConfigDataSelector);
    const rootRef = useRef<HTMLDivElement>(null);
    const city = resolveCity(config?.tenant?.location);
    const route = useRoute();
    const deviceZmanimCount = useDeviceZmanimCount(route);
    const zmanimCount = resolveZmanimCount(config, route, deviceZmanimCount);

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
                {bodyOverride ?? <DashboardBody titles={titles} times={times} count={zmanimCount} infoPaused={infoPaused} />}
            </DashboardShell>
        </div>
    );
};
