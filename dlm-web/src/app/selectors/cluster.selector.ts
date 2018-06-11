/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { createSelector } from 'reselect';
import { mapToList } from 'utils/store-util';
import { getClusters } from './root.selector';
import { getPrivileges } from './ambari.selector';
import { getEntities as getBeaconConfigStatusEntities } from './beacon-config-status.selector';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { Cluster } from 'models/cluster.model';
import { SERVICES } from 'constants/cluster.constant';
import { getAllBeaconAdminStatuses } from './beacon.selector';
import { BaseState } from 'models/base-resource-state';

export const getEntities = createSelector(getClusters, getPrivileges, (clusters, privileges) => {
  return Object.keys(clusters.entities).reduce((all, clusterId) => ({
    ...all,
    [clusterId]: {
      ...clusters.entities[clusterId],
      ...{privilege: privileges[clusterId]}
    }
  }), {}) as BaseState<Cluster>;
});
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

export const getClustersWithBeaconConfigs = createSelector(getAllClusters, getBeaconConfigStatusEntities, (clusters, configMap) => {
  return clusters.map((cluster: Cluster) => ({
    ...cluster,
    beaconConfigStatus: configMap[cluster.id]
  }));
});

export const getClustersWithBeacon = createSelector(getClustersWithBeaconConfigs, getAllBeaconAdminStatuses,
  (clusters, beaconAdminStatus) => {
    return clusters.map((cluster: Cluster) => ({
      ...cluster,
      beaconAdminStatus: beaconAdminStatus.find(b => b.clusterId === cluster.id)
    }));
  });
