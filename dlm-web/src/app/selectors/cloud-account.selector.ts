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
import { mapToList, createEntitySelector, belongsTo, KeyTarget } from 'utils/store-util';
import { getCloudAccounts } from './root.selector';
import { getContainersGroupedByAccounts } from './cloud-container.selector';
import {getEntities as getBeaconCloudEntities, getAllBeaconCloudCreds} from './beacon-cloud-cred.selector';
import {contains} from 'utils/array-util';
import { AccountStatus, CloudAccount } from 'models/cloud-account.model';
import { S3 } from 'constants/cloud.constant';
import {sortByDateField} from '../utils/array-util';
import { BeaconCloudCred } from 'models/beacon-cloud-cred.model';

export const accountsMap = createSelector(getCloudAccounts, (state) => ({
  entities: {
    ...['WASB', 'AWS', 'ADLS', 'GCS'].reduce((acc, key) => ({...acc, ...state[key].entities}), {})
  }
}));

export const cloudAccounts = createEntitySelector<CloudAccount>('CloudAccount', accountsMap, {
  beaconCloudCred: belongsTo('BeaconCloudCred', {
    id: 'name',
    target: KeyTarget.Self
  })
});

export const getEntities = (type) => createSelector(getCloudAccounts, state => state[type].entities);
export const getAllAccounts =
  createSelector(getEntities('WASB'), getEntities('AWS'), getEntities('ADLS'), getEntities('GCS'), (wasb, aws, adls, gcs) =>
    [...mapToList(wasb), ...mapToList(aws), ...mapToList(adls), ...mapToList(gcs)]);

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
      const {policies, clusters} = beaconCloudCred;
      const policiesWithLastTenJobs = (policies || []).map(policy => {
        return {
          ...policy,
          lastTenJobs: sortByDateField(policy.jobs, 'startTime').slice(0, 10),
        };
      });
      return {
        ...a,
        policies: policiesWithLastTenJobs,
        clusters: clusters || []
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
      const cloudCred = cred.cloudCred || {} as BeaconCloudCred;
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
