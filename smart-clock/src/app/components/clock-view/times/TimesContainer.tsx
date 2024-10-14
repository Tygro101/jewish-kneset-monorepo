import { useEffect, useState } from "react";
import { format } from 'date-fns';
import './TimesContainer.scss';
import { TypedObjectMap } from "@shared/models/shared";
import { Brown } from "../../../shared/themes";

export type MapProp = Map<string, { title: string, format: string}>;
export type MultiMapProp = Map<string, MapProp>;
export type IsEnabled = (daytimes: TypedObjectMap<Date>)=> boolean;
export type IsEnabledMap = Map<string, IsEnabled>;
export interface TimesProps { times: TypedObjectMap<Date>, map: MultiMapProp, isEnabled: IsEnabledMap }

export const TimesContainer = (props: TimesProps) => {


    return <div className="times-content">
        {Object.keys(props.times ?? {}).map(key => (<div className="title">
            {key}
        </div>))}
    </div>
}