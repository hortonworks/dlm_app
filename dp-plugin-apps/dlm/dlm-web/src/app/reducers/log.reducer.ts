/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {Log} from 'models/log.model';
import {BaseState} from 'models/base-resource-state';
import * as fromLog from 'actions/log.action';
import { toEntities } from 'utils/store-util';

export type State = BaseState<Log>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromLog.ActionTypes.LOAD_LOGS.SUCCESS:
      return loadLogSuccess(state, action);

    default:
      return state;
  }
}

function loadLogSuccess(state = initialState, action): State {
  const log = action.payload.response;
  const instanceId = action.payload.meta.instanceId;
  const logEntity = {
    [instanceId]: {
      ...log,
      instanceId
    }
  };
  return {
    entities: Object.assign({}, state.entities, logEntity)
  };
}
