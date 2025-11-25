import { isDevMode } from "@angular/core";
import { ActionReducerMap, State, MetaReducer } from "@ngrx/store";
import { IRootState } from "./models";
import { timesReducer } from "./times/reducers";



export const reducers: ActionReducerMap<IRootState> = {
    times: timesReducer
};


export const metaReducers: MetaReducer<IRootState>[] = isDevMode() ? [] : [];
