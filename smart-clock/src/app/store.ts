import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import timeReducer from './components/store/times/timesSlice';
import titlesReducer from './components/store/titles/titlesSlice';
import { StateKeys } from "./store.models";


export const store = configureStore({
  reducer: {
    [StateKeys.Times]: timeReducer,
    [StateKeys.Titles]: titlesReducer
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
