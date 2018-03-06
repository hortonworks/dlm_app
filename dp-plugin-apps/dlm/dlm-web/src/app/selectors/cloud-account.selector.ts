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
import {getEntities as getBeaconCloudEntities, getAllBeaconCloudCreds} from './beacon-cloud-cred.selector';
import {groupByKey, contains} from 'utils/array-util';
import { AccountStatus } from 'models/cloud-account.model';
import { S3 } from 'constants/cloud.constant';

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
  createSelector(getAllAccounts, getBeaconCloudEntities, (accounts, beaconCloudCreds) => {
    return accounts.map(a => {
      const beaconCloudCred = beaconCloudCreds[a.id];
      if (!beaconCloudCred) {
        return a;
      }
      return {
        ...a,
        policies: beaconCloudCred.policies || [],
        clusters: beaconCloudCred.clusters || []
      };
    });
  });

export const getCloudStoreProgress = createSelector(getCloudAccounts, state => state.progress);

export const getAccountsStatusEntities = createSelector(getCloudAccounts, state => state.status.entities);
export const getAllAccountsStatuses = createSelector(getAccountsStatusEntities, entities => mapToList(entities));

export const getFullAccountsInfo = createSelector(getAllAccountsWithPolicies, getAccountsStatusEntities, (accounts, statuses) => {
  return accounts.map(account => ({
    ...account,
    status: statuses[account.id] && statuses[account.id].status
  }));
});

export const getUnregisteredDLMCreds = createSelector(getAllAccounts, getAllBeaconCloudCreds, (accounts, beaconCloudCreds) => {
    const accountIds = accounts.map(a => a.id);
    return beaconCloudCreds.reduce((acc, cred) => {
      const cloudCred = cred.cloudCred || {};
      const beaconProviderToDlm = {
        AWS: S3
      };
      if (!contains(accountIds, cred.name)) {
        return acc.concat({
          ...cred,
          id: cred.name,
          accountDetails: {
            provider: beaconProviderToDlm[cloudCred.provider] || S3
          },
          status: AccountStatus.Unregistered
        });
      }
      return acc;
    }, []);
});
