import { createSelector } from 'reselect';
import { getDatabasesList } from './root.selector';
import { mapToList } from 'utils/store-util';

export const getEntities = createSelector(getDatabasesList, state => state.entities);
export const getAllDatabases = createSelector(getEntities, mapToList);
export const getDatabase = (entityId: string) => createSelector(getEntities, entities => entities[entityId]);
