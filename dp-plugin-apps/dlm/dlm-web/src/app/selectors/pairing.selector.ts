/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
        pairs: pairs.filter(pair => pair.pair.some(clust => clust.id === entity.id)).length
      }
    });
  }, {});
});
