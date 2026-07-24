import { RootState } from '../../../store';

export const getConfigSelector = (state: RootState) => state.config;
export const getConfigDataSelector = (state: RootState) => state.config.data;
export const getConfigStatusSelector = (state: RootState) => state.config.status;
export const getTenantIdSelector = (state: RootState) => state.config.tenantId;
