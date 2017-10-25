/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { BaseState } from 'models/base-resource-state-array';
import { UnreachableBeacon } from 'models/unreachable-beacon.model';
import { ActionSuccess } from 'utils/extended-actions.type';
import { isSuccessAction } from 'utils/type-action';

export type State = BaseState<UnreachableBeacon>;

const initialState = {
  entities: []
};

export function reducer(state = initialState, action: ActionSuccess): State {
  // filter through all request actions and get `unreachableBeacon` from response
  if (isSuccessAction(action)) {
    const response = action.payload.response || {};
    // some responses may not contain `unreachableBeacon` so take stored data
    const unreachableBeacon = response.unreachableBeacon === undefined ? state.entities :
      response.unreachableBeacon;
    return {
      entities: unreachableBeacon
    };
  }
  return state;
}
