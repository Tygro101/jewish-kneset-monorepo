import { useEffect, useState } from "react";
import { format } from 'date-fns';
import './TimesContainer.scss';
import { TypedObjectMap } from "@shared/models/core";
import { TimeState } from "../../store/times/timesState";
import { TimesKeys } from "@shared/core/services/workers/handlers/constants/times.keys";
import { useTimesContainerLogic } from './TimesContainerHooks';
import SunriseIcon from '../../../../assets/icons/sunrise.svg?raw';
import SunsetIcon from '../../../../assets/icons/sunset.svg?raw';
import SunIcon from '../../../../assets/icons/sun.svg?raw';
import MoonIcon from '../../../../assets/icons/moon.svg?raw';
import SparklesIcon from '../../../../assets/icons/sparkles.svg?raw';
import Ripple from '../../../../assets/icons/ripple.svg?raw';

export type MapProp = Map<string, { key: string, format: string }>;
export type MultiMapProp = Map<string, MapProp>;
export type IsEnabled = (daytimes: TypedObjectMap<Date>) => boolean;
export type IsEnabledMap = Map<string, IsEnabled>;
export interface TimesProps { times: TimeState, map: MapProp, isEnabled?: IsEnabledMap }

const iconsMap: TypedObjectMap<{ icon: string; color: string }> = {
    [TimesKeys.Netz]: { icon: SunriseIcon, color: '#fdc700' },
    [TimesKeys.Shkiah]: { icon: SunsetIcon, color: 'orange' },
    [TimesKeys.TzetShabat]: { icon: MoonIcon, color: 'orange' },
    [TimesKeys.TzetCochavimGeonim]: { icon: MoonIcon, color: '#615fff' },
    [TimesKeys.SofShemaMagenAvraham]: { icon: SunIcon, color: 'orange' },
    [TimesKeys.SofBirkotKeriatShemaMagenAvraham]: { icon: SunIcon, color: 'orange' },
    [TimesKeys.MinchaGdola]: { icon: SunIcon, color: 'orange' },
    [TimesKeys.MinchaKtana]: { icon: SunIcon, color: 'orange' },
    [TimesKeys.PlagMincha]: { icon: SparklesIcon, color: 'orange' },
    [TimesKeys.AlotHaShahar]: { icon: SparklesIcon, color: '#fdc700' },
    [TimesKeys.ChatzotLailah]: { icon: MoonIcon, color: '#615fff' },
    [TimesKeys.TallitAndTefillin]: { icon: Ripple, color: 'orange' },
    // fallback icons
    default: { icon: SunIcon, color: 'orange' }
};

export const TimesContainer = (props: TimesProps) => {
    const { relevantKeys, closestIndex } = useTimesContainerLogic(props.times);

    return <div className="times-content">
        {
            Object.keys(props.times ?? {})?.length && relevantKeys.map((item, idx) => {
                const iconObj = iconsMap[item.main] ?? iconsMap.default;
                const cls = idx === closestIndex ? 'time-item current' : 'time-item';
                return <div key={String(item.main)} className={cls}>
                    <div className="time-wrapper">
                        <div className="time-title">
                            <div className="icon" style={{ color: iconObj.color }} dangerouslySetInnerHTML={{ __html: iconObj.icon }} />
                            <div className="title">{props.times[item.main]?.generalName || props.times[item.main]?.name} </div>
                        </div>
                        <div className="time-value">
                            <div>
                                {props.times[item.main]?.date && format(new Date(props.times[item.main]?.date), 'hh:mm:ss')}
                            </div>
                            {//item.additions && item.additions.length && <span>-</span> 
                            }
                            {item.additions && item.additions?.filter(key => !!props.times[key]).map((key) => {
                                return <div>
                                    {format(new Date(props.times[key]?.date), 'hh:mm:ss')}
                                </div>
                            })}

                        </div>
                    </div>
                </div>
            })

        }
    </div>
}