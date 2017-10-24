/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getUnreachableBeacons } from 'selectors/root.selector';
import { getAllClusters } from 'selectors/cluster.selector';
import { UnreachableBeacon } from 'models/unreachable-beacon.model';
import { Cluster } from 'models/cluster.model';

export const getEntities = createSelector(getUnreachableBeacons, state => state.entities);
export const getUnreachableClusters = createSelector(getAllClusters, getEntities,
  (clusters: Cluster[], unreachableBeacons: UnreachableBeacon[]) => {
    return unreachableBeacons.reduce((allClusters, beacon) => {
      const cluster = clusters.find(c => c.beaconUrl === beacon.beaconUrl);
      return allClusters.concat(cluster || []);
    }, []);
  });
