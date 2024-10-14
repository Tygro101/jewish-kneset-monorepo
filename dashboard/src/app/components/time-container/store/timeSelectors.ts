import { RootState } from "../../../app/store";
import { TimeState } from "./timeState";


export const getTimesSelector = (state: RootState) => state.times.times;