import { createSelector } from 'reselect';
import { mapToList } from 'utils/store-util';
import { getClusters } from './root.selector';

export const getEntities = createSelector(getClusters, state => state.entities);
export const getAllClusters = createSelector(getEntities, mapToList);
export const getCluster = (entityId: string) => createSelector(getEntities, entities => entities[entityId]);
