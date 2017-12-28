/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { BaseState } from 'models/base-resource-state';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { toEntities } from 'utils/store-util';
import * as fromBeacon from 'actions/beacon.action';

export type State = BaseState<BeaconAdminStatus>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromBeacon.ActionTypes.LOAD_BEACON_ADMIN_STATUS.SUCCESS:
      const statusList = action.payload.response.response;
      return {
        ...state,
        entities: toEntities<BeaconAdminStatus>(statusList)
      };
    default:
      return state;
  }
}
