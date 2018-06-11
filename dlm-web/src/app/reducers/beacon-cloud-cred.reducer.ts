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

import { BaseState } from 'models/base-resource-state';
import {
  BeaconCloudCred, BeaconCloudCredWithPoliciesResponse, BeaconCloudCredentialsResponse, CloudAccountSyncStatus
} from 'models/beacon-cloud-cred.model';
import { toEntities } from 'utils/store-util';
import * as fromBeacon from 'actions/beacon-cloud-cred.action';
import * as fromCloudAccount from 'actions/cloud-account.action';
import {flatten} from 'utils/array-util';
import { omit } from 'utils/object-utils';
import { CloudAccountStatus } from 'models/cloud-account.model';

export type State = BaseState<BeaconCloudCred>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS.SUCCESS:
      return {
        ...state,
        entities: remapCloudCreds(action.payload.response)
      };
    case fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.SUCCESS:
      const credsWithPoliciesResponse: BeaconCloudCredWithPoliciesResponse = action.payload.response;
      return {
        ...state,
        entities: toEntities<BeaconCloudCred>(credsWithPoliciesResponse.allCloudCreds, 'name')
      };
    case fromCloudAccount.ActionTypes.DELETE_CLOUD_STORE.SUCCESS: {
      if (!action.payload.response) {
        return state;
      }
      const { id } = action.payload.response;
      return {
        entities: omit(state.entities, id)
      };
    }
    default:
      return state;
  }
}

function remapCloudCreds(beaconCreds: BeaconCloudCredentialsResponse) {
  return beaconCreds.allCloudCreds.reduce((credsMap, clusterCred) => {
    const clusterId = clusterCred.clusterId;
    clusterCred.cloudCreds.cloudCred.forEach(cred => {
      const clusters: CloudAccountSyncStatus[] = ((credsMap[cred.name] || {} as BeaconCloudCred).clusters || []).concat({
        isInSync: null,
        clusterId,
        cloudCredId: cred.id
      } as CloudAccountSyncStatus);
      if (cred.name in credsMap) {
        credsMap[cred.name] = {
          ...credsMap[cred.name],
          clusters
        };
      } else {
        credsMap[cred.name] = {
          ...cred,
          clusters
        };
      }
    });
    return credsMap;
  }, {} as {[credName: string]: BeaconCloudCred});
}
