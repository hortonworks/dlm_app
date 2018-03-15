/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { toMapByField } from './object-utils';

export const filterClustersByTDE = (clusters, beaconStatuses) => {
  const beaconStatusMap = toMapByField(beaconStatuses, 'clusterId');
  return clusters.filter(c => !!beaconStatusMap.get(c.id).beaconAdminStatus.replication_TDE);
};
