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
export const getClusterWithUnreachableBeacon = createSelector(getAllClusters, getEntities,
  (clusters: Cluster[], unreachableBeacons: UnreachableBeacon[]) => {
    return unreachableBeacons.reduce((clustersAndBeacons, beacon) => {
      const cluster = clusters.find(c => c.beaconUrl === beacon.beaconUrl);
      return clustersAndBeacons.concat({
        cluster: { ...cluster },
        unreachableBeacon: { ...beacon }
      } || []);
    }, []);
});
