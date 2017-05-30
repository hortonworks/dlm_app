import { createSelector } from 'reselect';
import { getOperations } from './root.selector';
import { mapToList } from 'utils/store-util';

export const getEntities = createSelector(getOperations, state => state.entities);
export const getAllOperationResponses = createSelector(getEntities, mapToList);
export const getLastOperationResponse = createSelector(getOperations, state => state.lastResponse);
