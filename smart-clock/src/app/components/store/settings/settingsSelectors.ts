import { RootState } from '../../../store';

export const getNetzCountdownEnabledSelector = (state: RootState) =>
    state.settings.netzCountdownEnabled;

export const getNetzCountdownMinutesSelector = (state: RootState) =>
    state.settings.netzCountdownMinutes;

export const getPresentationsBlockedSelector = (state: RootState) =>
    state.settings.presentationsBlocked;

export const getMessagesBlockedSelector = (state: RootState) =>
    state.settings.messagesBlocked;

export const getScheduleBlockedSelector = (state: RootState) =>
    state.settings.scheduleBlocked;


export const getScheduleDaysAheadTvSelector = (state: RootState) =>
    state.settings.scheduleDaysAheadTv;

export const getScheduleDaysAheadTabletSelector = (state: RootState) =>
    state.settings.scheduleDaysAheadTablet;
