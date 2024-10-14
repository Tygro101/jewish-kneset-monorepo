
import { RootState } from "../../../store";
import { TimeState } from "./timesState";


export const getTimesSelector = (state: RootState) => state.times;