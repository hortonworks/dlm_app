import { createSelector } from 'reselect';
import { PairsCount } from 'models/pairs-count.model';
import { getPairings } from './root.selector';
import { mapToList } from '../utils/store-util';
import { getAllClusters } from './cluster.selector';

export const getEntities = createSelector(getPairings, (state) => state.entities);
export const getProgress = createSelector(getPairings, (state) => state.progress);
export const getAllPairings = createSelector(getEntities, mapToList);
export const getPairing = (entityId: string) => createSelector(getEntities, (entities) => entities[entityId]);
export const getCountPairsForClusters = createSelector(getAllPairings, getAllClusters, (pairs, clusters) => {
  const clustersWithPairs = clusters.map(cluster => {
    return {
      clusterId: cluster.id,
      clusterName: cluster.name,
      pairs: pairs.filter(pair => pair.pair.filter(clust => clust.id === cluster.id).length > 0).length
    };
  });
  return clustersWithPairs.reduce((entities: { [id: number]: PairsCount }, entity: PairsCount) => {
    return Object.assign({}, entities, {
      [entity.clusterId]: entity
    });
  }, {});
});
