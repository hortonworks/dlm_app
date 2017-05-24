import { createSelector } from 'reselect';
import { PairsCount } from 'models/pairs-count.model';
import { Cluster } from 'models/cluster.model';
import { getPairings } from './root.selector';
import { mapToList } from '../utils/store-util';
import { getAllClusters } from './cluster.selector';

export const getEntities = createSelector(getPairings, (state) => state.entities);
export const getProgress = createSelector(getPairings, (state) => state.progress);
export const getAllPairings = createSelector(getEntities, mapToList);
export const getPairing = (entityId: string) => createSelector(getEntities, (entities) => entities[entityId]);
export const getCountPairsForClusters = createSelector(getAllPairings, getAllClusters, (pairs, clusters) => {
  return clusters.reduce((entities: { [id: number]: PairsCount }, entity: Cluster) => {
    return Object.assign({}, entities, {
      [entity.id]: {
        clusterId: entity.id,
        clusterName: entity.name,
        pairs: pairs.filter(pair => pair.pair.filter(clust => clust.id === entity.id).length > 0).length
      }
    });
  }, {});
});
