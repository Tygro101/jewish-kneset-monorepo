import { useEffect, useRef } from "react";
import { useAutoScrollOnOverflow } from '../../hooks/useAutoScrollOnOverflow';
import { ClockContainer } from "./clock/ClockContainer";
import './ClockView.scss';
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getTimesSelector } from "../store/times/timesSelectors";
import { calculateTimes } from "../store/times/timesSlice";
import { useSelector } from "react-redux";
import { CitiesEnum, IClockTitle } from "@shared/core/services/workers/handlers/models/shared-models";
import { calculateTitles } from "../store/titles/titlesSlice";
import { getTitlesSelector } from "../store/titles/titlesSelectors";
import { MapProp, TimesContainer } from "./times/TimesContainer";
import { TitlesKeys } from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import { NetzKey } from "@shared/core/services/workers/handlers/constants/times.keys";
import { TitlesContainer } from "./titles/TitlesView";
import { IconButton } from '@shared-react/buttons/IconButton';
import Plus from '../../../assets/icons/plus.svg?raw';

// will be moved to folder

const netzMap: MapProp = new Map();
netzMap.set(NetzKey, { key: NetzKey, format: 'H:mm:ss' })

export const ClockView = () => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const titles = useAppSelector(getTitlesSelector);
    const time = new Date();
    console.log(times);
    console.log(titles);
    useEffect(() => {
        dispatch(calculateTimes({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
        dispatch(calculateTitles({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
    }, [])

    const titlesRef = useRef<HTMLDivElement | null>(null);

    // attach auto-scroll on overflow for titles container
    useAutoScrollOnOverflow({
        deps: [titles],
        containerRef: titlesRef,
        options: { downDuration: 5000, upDuration: 5000, pauseMs: 10000, startPauseMs: 3000 }
    });
    return <div className="content-container" >
        <div className="main-time-container">
            <div className="main">
                <ClockContainer></ClockContainer>
            </div>
            <div className="date">
                {time.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {(titles[TitlesKeys.HebrewDate] as IClockTitle)?.title}
            </div>
        </div>

        <div className="center-container">
            <div className="center-title">
                text
                <span>0</span>
                <span>0</span>
                <IconButton icon={Plus}></IconButton>
            </div>
            <div className="titles" ref={titlesRef}>
                <TitlesContainer titles={titles}></TitlesContainer>
            </div>
        </div>

        <div className="times">
            <TimesContainer times={times} map={netzMap}></TimesContainer>
        </div>

    </div>
}