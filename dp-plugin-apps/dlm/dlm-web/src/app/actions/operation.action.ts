/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type } from 'utils/type-action';
import { OperationResponse } from 'models/operation-response.model';
import { Action } from '@ngrx/store';
export const ActionTypes = {
  OPERATION_COMPLETE: type('OPERATION_COMPLETE'),
  OPERATION_FAIL: type('OPERATION_FAIL')
};

export const operationComplete = (payload: OperationResponse): Action => {
  const operation = {id: _getId(), ...payload};
  return {
    type: ActionTypes.OPERATION_COMPLETE,
    payload: operation
  };
};
export const operationFail = (payload: any): Action => {
  // @todo hack to get real response
  const msg = payload.message.replace('Failed with ', '');
  const operation = JSON.parse(msg).error;
  operation.id = _getId();
  return {
    type: ActionTypes.OPERATION_FAIL,
    payload: operation
  };
};

function _getId() {
  return String(new Date().getTime());
}
