import { format } from 'date-fns';
import './TimesContainer.scss';
import { TimeState } from "../../store/times/timesState";
import { useTimesContainerLogic } from './TimesContainerHooks';

export interface TimesProps {
    times: TimeState;
}

export const TimesContainer = (props: TimesProps) => {
    const { relevantKeys, closestIndex } = useTimesContainerLogic(props.times);

    if (!Object.keys(props.times ?? {}).length || !relevantKeys.length) {
        return null;
    }

    const count = relevantKeys.filter((i) => props.times[i.main as unknown as string]?.date).length;
    const cols = count <= 3 ? Math.max(count, 1) : count === 4 ? 2 : 3;
    const rows = Math.ceil(count / cols) || 1;

    return (
        <div
            className="zmanim-grid"
            data-fit-measure
            style={{ '--zman-cols': cols, '--zman-rows': rows } as React.CSSProperties}
        >
            {relevantKeys.map((item, idx) => {
                const timeData = props.times[item.main as unknown as string];
                if (!timeData?.date) return null;

                const isCurrent = idx === closestIndex;
                const hebrewName = timeData.generalName || timeData.name;
                const mainTime = format(new Date(timeData.date), 'H:mm');
                const seconds = format(new Date(timeData.date), 'ss');
                // Additions (e.g., Gra times shown as secondary)
                const additionTimes = (item.additions ?? [])
                    .filter((key) => !!props.times[key as unknown as string]?.date)
                    .map((key) => format(new Date(props.times[key as unknown as string].date), 'H:mm'));

                return (
                    <div
                        key={String(item.main)}
                        className={`zman-card ${isCurrent ? 'current' : ''}`}
                    >
                        {isCurrent && <div className="zman-glow" />}
                        <div className="zman-name">{hebrewName}</div>
                        <div className="zman-time" dir="ltr">
                            <span className="zman-time-main">{mainTime}<span className="zman-time-seconds">:{seconds}</span></span>
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
