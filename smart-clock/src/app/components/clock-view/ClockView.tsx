import { useEffect } from "react";

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

// will be moved to folder

const netzMap:MapProp = new Map();
netzMap.set(NetzKey, {key: NetzKey, format: 'H:mm:ss'})

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
    return <div className="content-container" >
        <div className="main-time-container">
        <div className="main">
            <ClockContainer></ClockContainer>
        </div>
        <div className="date">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {(titles[TitlesKeys.HebrewDate] as IClockTitle)?.title}
        </div>
        </div>

        <div className="times">
            <TimesContainer times={times} map={netzMap}></TimesContainer>
        </div>

    </div>
}