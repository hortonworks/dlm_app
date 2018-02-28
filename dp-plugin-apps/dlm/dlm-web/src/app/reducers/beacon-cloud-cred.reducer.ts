/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { BaseState } from 'models/base-resource-state';
import { BeaconCloudCred, BeaconCloudCredWithPoliciesResponse } from 'models/beacon-cloud-cred.model';
import { toEntities } from 'utils/store-util';
import * as fromBeacon from 'actions/beacon-cloud-cred.action';
import {flatten} from 'utils/array-util';

export type State = BaseState<BeaconCloudCred>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS.SUCCESS:
      const creds = flatten(action.payload.response.cloudCred.map(c => c.cloudCreds.cloudCred));
      return {
        ...state,
        entities: toEntities<BeaconCloudCred>(creds)
      };
    case fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.SUCCESS:
      const credsWithPoliciesResponse: BeaconCloudCredWithPoliciesResponse = action.payload.response;
      return {
        ...state,
        entities: toEntities<BeaconCloudCred>(credsWithPoliciesResponse.allCloudCreds, 'name')
      };
    default:
      return state;
  }
}
