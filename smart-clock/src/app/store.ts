import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import counterReducer from '../features/counter/counterSlice';
import timeReducer from './components/store/times/timesSlice';
import titlesReducer from './components/store/titles/titlesSlice';
import configReducer from './components/store/config/configSlice';
import settingsReducer from './components/store/settings/settingsSlice';
import { StateKeys } from "./store.models";


export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [StateKeys.Times]: timeReducer,
    [StateKeys.Titles]: titlesReducer,
    [StateKeys.Config]: configReducer,
    [StateKeys.Settings]: settingsReducer,
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
