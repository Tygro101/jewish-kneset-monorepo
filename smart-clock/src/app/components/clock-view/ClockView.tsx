import { useRef } from 'react';
import { useDailyRecalc } from '../../hooks/useDailyRecalc';
import { useFitToScreen } from '../../hooks/useFitToScreen';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getTimesSelector } from '../store/times/timesSelectors';
import { calculateTimes } from '../store/times/timesSlice';
import { CitiesEnum } from '@shared/core/services/workers/handlers/models/shared-models';
import { calculateTitles } from '../store/titles/titlesSlice';
import { getTitlesSelector } from '../store/titles/titlesSelectors';
import { SettingsMenu } from '../settings/SettingsMenu';
import { DashboardShell } from './DashboardShell';
import { DashboardHeader } from './DashboardHeader';
import { DashboardBody } from './DashboardBody';
import './ClockView.scss';

export interface ClockViewProps {
  /** When provided, replaces the default DashboardBody (info cards + zmanim). */
  bodyOverride?: React.ReactNode;
}

export const ClockView = ({ bodyOverride }: ClockViewProps = {}) => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const titles = useAppSelector(getTitlesSelector);
    const rootRef = useRef<HTMLDivElement>(null);

    useFitToScreen(rootRef, [times, titles], { cssVar: '--fit-scale' });

    useDailyRecalc(() => {
        dispatch(calculateTimes({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
        dispatch(calculateTitles({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
    });

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
