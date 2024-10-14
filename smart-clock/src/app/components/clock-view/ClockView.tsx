import { useEffect } from "react";

import { ClockContainer } from "./clock/ClockContainer";

import './ClockView.scss';
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getTimesSelector } from "../store/times/timesSelectors";
import { calculateTimes } from "../store/times/timesSlice";
import { useSelector } from "react-redux";
import { CitiesEnum } from "@shared/core/services/workers/handlers/models/shared-models";
import { calculateTitles } from "../store/titles/titlesSlice";
import { getTitlesSelector } from "../store/titles/titlesSelectors";
import { TimesContainer } from "./times/TimesContainer";
import { Brown } from "../../shared/themes";


export const ClockView = () => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const titles = useAppSelector(getTitlesSelector);
    useEffect(() => {
        dispatch(calculateTimes({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
        dispatch(calculateTitles({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
    }, [])
    return <div className="content-container"  style={{background: Brown.MainBackground}}>
        <div className="header">

        </div>
        <div className="main">
            <ClockContainer></ClockContainer>
        </div>
        <div className="footer">
            <TimesContainer times={times} map={new Map()} ></TimesContainer>
        </div>

    </div>
}