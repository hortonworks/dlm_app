import { createSelector } from 'reselect';
import { mapToList } from 'utils/store-util';
import { getClusters } from './root.selector';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { Cluster } from 'models/cluster.model';
import { SERVICES } from 'constants/cluster.constant';

export const getEntities = createSelector(getClusters, state => state.entities);
export const getAllClusters = createSelector(getEntities, mapToList);
export const getCluster = (entityId: string) => createSelector(getEntities, entities => entities[entityId]);
export const getUnhealthyClusters = createSelector(getAllClusters,
  (clusters: Cluster[]) => clusters.filter(cluster => cluster.healthStatus === CLUSTER_STATUS.UNHEALTHY));
export const getClustersWithLowCapacity = createSelector(
  getAllClusters,
  (clusters: Cluster[]) => clusters.filter(cluster => cluster.stats.CapacityRemaining / cluster.stats.CapacityTotal < 0.1));
export const getClustersWithStopppedBeacon = createSelector(getAllClusters,
  (clusters: Cluster[]) => clusters.filter(cluster => {
    return (cluster.status || []).some(s => s.service_name === SERVICES.BEACON && s.state !== SERVICE_STATUS.STARTED);
  }));
