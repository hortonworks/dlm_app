/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as operationAction from 'actions/operation.action';
import { OperationResponse } from 'models/operation-response.model';

export interface State {
  entities: { [id: string]: OperationResponse };
  lastResponse: OperationResponse;
}

export const initialState: State = {
  entities: {},
  lastResponse: null
};

export function reducer(state = initialState, action): State {

  switch (action.type) {
    case operationAction.ActionTypes.OPERATION_COMPLETE:
    case operationAction.ActionTypes.OPERATION_FAIL:
      return operationFinished(state, action);

    default:
      return state;
  }
}

function operationFinished(state: State, action): State {
  const newOperationResponse = action.payload;
  const id = String(new Date().getTime());
  const newEntity = {id, ...newOperationResponse};
  const entities = Object.assign({}, state.entities, {[id]: newEntity});
  return Object.assign({}, state, {entities, lastResponse: newEntity});
}
