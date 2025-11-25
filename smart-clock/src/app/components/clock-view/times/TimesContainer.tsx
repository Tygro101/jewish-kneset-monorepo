import { useEffect, useState } from "react";
import { format } from 'date-fns';
import './TimesContainer.scss';
import { TypedObjectMap } from "@shared/models/core";
import { Brown } from "../../../shared/themes";
import { TimeState } from "../../store/times/timesState";

export type MapProp = Map<string, { key: string, format: string }>;
export type MultiMapProp = Map<string, MapProp>;
export type IsEnabled = (daytimes: TypedObjectMap<Date>) => boolean;
export type IsEnabledMap = Map<string, IsEnabled>;
export interface TimesProps { times: TimeState, map: MapProp, isEnabled?: IsEnabledMap }

export const TimesContainer = (props: TimesProps) => {


    const getTime = (key: string) => {
        const date = new Date(props.times[props.map.get(key).key].date);
        const value = format(date, props.map.get(key).format);
        return value;
    }

    const [times, setTimes] = useState([]);

    return <div className="times-content">
        {
            Object.keys(props?.times).length && Object.keys(props?.times).map((timeKey)=>{
                return <div className="time-wrapper">
                    <div className="time-title">
                        <div className="icon">O</div>
                        <div className="title">{props.times[timeKey].shortName}</div>
                    </div>
                    <div className="time-value">
                        {format(new Date(props.times[timeKey].date), 'hh:mm:ss')}
                    </div>
                </div>
            })
        }
    </div>
}