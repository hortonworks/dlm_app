/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { getBeaconAdminStatuses } from './root.selector';
import { mapToList } from 'utils/store-util';
import { contains } from 'utils/array-util';
import { SERVICES } from 'constants/cluster.constant';

export const getEntities = createSelector(getBeaconAdminStatuses, state => state.entities);
export const getAllBeaconAdminStatuses = createSelector(getEntities, mapToList);
export const getRangerEnabled = createSelector(getAllBeaconAdminStatuses,
  (statusList: BeaconAdminStatus[]): BeaconAdminStatus[] =>
    statusList.filter(status => contains(status.beaconAdminStatus.plugins, SERVICES.RANGER)));
