import { useEffect, useRef, useState } from "react";
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
import { AgendaContainer } from "./agenda/AgendaContainer";

// will be moved to folder

enum ClockCenterViews {
    Annotations = 'Annotations',
    Agenda = 'Agenda'
}


const netzMap: MapProp = new Map();
netzMap.set(NetzKey, { key: NetzKey, format: 'H:mm:ss' })

export const ClockView = () => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const titles = useAppSelector(getTitlesSelector);

    const [currentView, setCurrentView] = useState(ClockCenterViews.Annotations);

    // toggle currentView between possible enum values every 3 seconds
    // useEffect(() => {
    //     const values = Object.values(ClockCenterViews) as ClockCenterViews[];
    //     const id = setInterval(() => {
    //         setCurrentView(prev => {
    //             const idx = values.indexOf(prev);
    //             const next = values[(idx + 1) % values.length];
    //             return next;
    //         });
    //     }, 3000);
    //     return () => clearInterval(id);
    // }, []);


    useEffect(() => {
        dispatch(calculateTimes({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
        dispatch(calculateTitles({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
    }, [])



    const titlesRef = useRef<HTMLDivElement | null>(null);
    const time = new Date();
    // attach auto-scroll on overflow for titles container
    useAutoScrollOnOverflow({
        deps: [titles],
        containerRef: titlesRef,
        options: { downDuration: 5000, upDuration: 5000, pauseMs: 10000, startPauseMs: 3000 }
    });


    const centerView = (view: ClockCenterViews, props: any): JSX.Element => {
        switch (view) {
            case ClockCenterViews.Agenda:
                return <AgendaContainer></AgendaContainer>;
            default:
                return <TitlesContainer {...props}></TitlesContainer>
        }
    }

    return <div className="content-container" >
        <div className="main-time-container">
            
            <div className="main">
                <ClockContainer></ClockContainer>
            </div>
            <div className="date">
                {(titles[TitlesKeys.HebrewDate] as IClockTitle)?.title}   -  {time.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
            </div>
        </div>

        <div className="center-container">
            {
                false && <div className="center-title">
                    <IconButton icon={Plus}></IconButton>
                    <div className="view-position">
                        <span className={`dot ${currentView === ClockCenterViews.Annotations ? 'dot-selected' : ''}`}></span>
                        <span className={`dot ${currentView === ClockCenterViews.Agenda ? 'dot-selected' : ''}`}></span>
                    </div>

                </div>
            }
            <div className="titles" ref={titlesRef}>
                {centerView(currentView, { titles })}
            </div>
        </div>

        <div className="times">
            <TimesContainer times={times} map={netzMap}></TimesContainer>
        </div>

    </div>
}