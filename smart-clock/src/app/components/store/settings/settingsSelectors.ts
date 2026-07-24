import { RootState } from '../../../store';

export const getNetzCountdownEnabledSelector = (state: RootState) =>
    state.settings.netzCountdownEnabled;

export const getNetzCountdownMinutesSelector = (state: RootState) =>
    state.settings.netzCountdownMinutes;
