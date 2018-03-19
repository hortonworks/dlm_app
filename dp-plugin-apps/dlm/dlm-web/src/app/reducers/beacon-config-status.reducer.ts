/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { BeaconConfigStatusResponse, BeaconConfigStatusDetails } from 'models/beacon-config-status.model';
import { BaseState } from 'models/base-resource-state';
import * as fromBeacon from 'actions/beacon.action';
import { addEntities } from 'utils/store-util';

export type State = BaseState<BeaconConfigStatusDetails>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromBeacon.ActionTypes.LOAD_BEACON_CONFIG_STATUS.SUCCESS:
      const response = action.payload.response as BeaconConfigStatusResponse;
      return addEntities<BeaconConfigStatusDetails>(state, response.configDetails, 'clusterId');
    default:
      return state;
  }
}
