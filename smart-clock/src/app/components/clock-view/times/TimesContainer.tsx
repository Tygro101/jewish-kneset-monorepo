import { format } from 'date-fns';
import './TimesContainer.scss';
import { TimeState } from '../../store/times/timesState';
import { useTimesContainerLogic } from './TimesContainerHooks';
import { resolveZmanName } from './zmanDisplayName';
import type { ZmanimCount } from '@shared/core/display/zmanim-count';

export interface TimesProps {
    times: TimeState;
    count?: ZmanimCount;
}

export const TimesContainer = (props: TimesProps) => {
    const count: ZmanimCount = props.count ?? 6;
    const { entries, currentIndex } = useTimesContainerLogic(props.times, count);

    if (!Object.keys(props.times ?? {}).length || !entries.length) {
        return null;
    }

    const cols = entries.length <= 3 ? Math.max(entries.length, 1) : entries.length === 4 ? 2 : 3;
    const rows = Math.ceil(entries.length / cols) || 1;

    return (
        <div
            className="zmanim-grid"
            data-fit-measure
            data-zman-count={count}
            style={{ '--zman-cols': cols, '--zman-rows': rows } as React.CSSProperties}
        >
            {entries.map((entry, idx) => {
                const timeData = props.times[entry.main as unknown as string];
                if (!timeData?.date) return null;

                const isCurrent = idx === currentIndex;
                const paired = entry.additions.length > 0;
                const hebrewName = resolveZmanName(timeData, { paired, count });
                const date = new Date(timeData.date);
                const mainTime = format(date, 'H:mm');
                const seconds = format(date, 'ss');
                const additionTimes = entry.additions
                    .map((key) => props.times[key as unknown as string])
                    .filter((item) => !!item?.date)
                    .map((item) => format(new Date(item.date), 'H:mm'));

                return (
                    <div key={entry.id} className={`zman-card ${isCurrent ? 'current' : ''}`}>
                        {isCurrent && <div className="zman-glow" />}
                        <div className="zman-name">{hebrewName}</div>
                        <div className="zman-time" dir="ltr">
                            <span className="zman-time-main">
                                {mainTime}
                              
                            </span>
                            {additionTimes.map((t, i) => (
                                <span key={i} className="zman-time-addition">{t}</span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
