import { createSelector } from 'reselect';
import { State } from '../reducers/cluster';
import { getClusters } from './root';

export const getEntities = createSelector(getClusters, (state) => state.entities);
export const getAll = createSelector(getEntities, (clusters) => Object.keys(clusters).map(id => clusters[id]));
