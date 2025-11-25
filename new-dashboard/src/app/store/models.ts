import { TypedMap } from "@shared/core/services/workers/handlers/models/shared-models";
import { TimeResponse } from "@shared/models/times";

export interface IRootState{
    times: TypedMap<TimeResponse>;
}