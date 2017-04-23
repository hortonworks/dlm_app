import { createSelector } from 'reselect';
import { State } from '../reducers/cluster.reducer';
import { getClusters } from './root.selector';

export const getEntities = createSelector(getClusters, (state) => state.entities);
export const getAllClusters = createSelector(getEntities, (clusters) => Object.keys(clusters).map(id => clusters[id]));
