/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { mapToList } from 'utils/store-util';
import { getCloudAccounts } from './root.selector';
import { getContainersGroupedByAccounts } from './cloud-container.selector';
import {getAllPolicies} from './policy.selector';
import {getAllBeaconCloudCreds} from './beacon-cloud-cred.selector';
import {groupByKey} from 'utils/array-util';

export const getEntities = (type) => createSelector(getCloudAccounts, state => state[type].entities);
export const getAllAccounts =
  createSelector(getEntities('WASB'), getEntities('S3'), getEntities('ADLS'), (wasb, s3, adls) =>
    [...mapToList(wasb), ...mapToList(s3), ...mapToList(adls)]);

export const getAllAccountsWithContainers =
  createSelector(getAllAccounts, getContainersGroupedByAccounts, (accounts, groupedContainers) =>
    accounts.map(a => {
      return {
        ...a,
        containers: groupedContainers[a.id]
      };
    }));

export const getAllAccountsWithPolicies =
  createSelector(getAllAccounts, getAllPolicies, getAllBeaconCloudCreds, (accounts, policies, beaconCloudCreds) => {
    const groupedBeaconCloudCreds = groupByKey(beaconCloudCreds, 'name');
    return accounts.map(a => {
      const beaconCloudCred = groupedBeaconCloudCreds[a.accountDetails.accountName];
      if (!beaconCloudCred) {
        return a;
      }
      const beaconCloudCredIds = beaconCloudCred.map(b => b.id);
      const _policies = policies.filter(p => beaconCloudCredIds.includes(p.customProperties.cloudCred));
      return {
        ...a,
        policies: _policies
      };
    });
  });

export const getCloudStoreProgress = createSelector(getCloudAccounts, state => state.progress);
