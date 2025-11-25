import { createSelector } from "@ngrx/store";
import { IRootState } from "../models";

export const rootState = (state: IRootState) => state;

export const getTimesSelector = createSelector(
    rootState,
  (state: IRootState) => state.times
);