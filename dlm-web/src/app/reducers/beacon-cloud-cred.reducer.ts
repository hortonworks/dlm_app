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

import {
  BeaconCloudCred, BeaconCloudCredWithPoliciesResponse, BeaconCloudCredentialsResponse, CloudAccountSyncStatus
} from 'models/beacon-cloud-cred.model';
import * as fromBeacon from 'actions/beacon-cloud-cred.action';
import * as fromCloudAccount from 'actions/cloud-account.action';
import { EntityState, createEntityAdapter } from '@ngrx/entity';

export interface State extends EntityState<BeaconCloudCred> {}

export const beaconCloudCredAdapter = createEntityAdapter<BeaconCloudCred>({
  selectId: (cred => cred.name)
});

export const initialState: State = beaconCloudCredAdapter.getInitialState({
  entities: {}
});

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS.SUCCESS:
      return beaconCloudCredAdapter.addAll(remapCloudCreds(action.payload.response), state);
    case fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.SUCCESS:
      const credsWithPoliciesResponse: BeaconCloudCredWithPoliciesResponse = action.payload.response;
      return beaconCloudCredAdapter.addAll(<BeaconCloudCred[]>remapCloudCredsWithPolicies(credsWithPoliciesResponse), state);
    case fromCloudAccount.ActionTypes.DELETE_CLOUD_STORE.SUCCESS: {
      if (!action.payload.response) {
        return state;
      }
      const { id } = action.payload.response;
      return beaconCloudCredAdapter.removeOne(id, state);
    }
    default:
      return state;
  }
}

function remapCloudCreds(beaconCreds: BeaconCloudCredentialsResponse) {
  return beaconCreds.allCloudCreds.reduce((credsMap: BeaconCloudCred[], clusterCred) => {
    const clusterId = clusterCred.clusterId;
    clusterCred.cloudCreds.cloudCred.forEach(cred => {
      const clusters: CloudAccountSyncStatus[] = ((credsMap[cred.name] || {} as BeaconCloudCred).clusters || []).concat({
        isInSync: null,
        clusterId,
        cloudCredId: cred.id
      } as CloudAccountSyncStatus);
      let newCred = credsMap.find(credMap => credMap.name === cred.name);
      if (newCred) {
        newCred = {
          ...newCred,
          clusters
        };
      } else {
        newCred = {
          ...cred,
          clusters
        };
      }
      credsMap.push(newCred);
    });
    return credsMap;
  }, []);
}

function remapCloudCredsWithPolicies(cloudCredsWithPolicies: BeaconCloudCredWithPoliciesResponse) {
  const remappedCloudCreds = cloudCredsWithPolicies.allCloudCreds.map(cred => {
    if ('cloudCred' in cred && 'clusters' in cred) {
      return {
        ...cred,
        clusters: cred.clusters.map(cluster => ({...cluster, cloudCredId: cred.cloudCred.id}))
      };
    }
    return cred;
  });
  return remappedCloudCreds;
}
