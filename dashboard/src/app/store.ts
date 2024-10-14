import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import timeReducer from './components/time-container/store/timeSlice';

export const store = configureStore({
  reducer: {
    times: timeReducer,
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
