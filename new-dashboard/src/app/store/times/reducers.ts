import { createReducer, on } from "@ngrx/store";
import { TypedMap } from "@shared/core/services/workers/handlers/models/shared-models";
import { TimeResponse } from "@shared/models/times";
import * as actions from './actions';




const initialState: TypedMap<TimeResponse> = undefined;
export const timesReducer = createReducer(
    initialState,
    on(actions.setTimesAction, (state, { times }) => ({ ...times }))
);