import { createAction, props } from "@ngrx/store";
import { TypedMap } from "@shared/core/services/workers/handlers/models/shared-models";
import { TimeResponse } from "@shared/models/times";


// set
export const SetTimes = '[Times] Set Times';


// get
export const GetTimes = '[Times] Get Times';


// set
export const setTimesAction = createAction(SetTimes, props<{times: TypedMap<TimeResponse>}>());

// get
export const getTimesAction = createAction(GetTimes);