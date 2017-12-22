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
import { ActionWithPayload } from 'actions/actions.type';
import { getError } from 'utils/http-util';
import { genId } from 'utils/string-utils';

export const ActionTypes = {
  OPERATION_COMPLETE: type('OPERATION_COMPLETE'),
  OPERATION_FAIL: type('OPERATION_FAIL')
};

export const operationComplete = (payload: OperationResponse): ActionWithPayload<any> => {
  const operation = {id: genId(), ...payload};
  return {
    type: ActionTypes.OPERATION_COMPLETE,
    payload: operation
  };
};
export const operationFail = (payload: any): ActionWithPayload<any> => {
  // @todo hack to get real response
  const operation = getError(payload);
  operation.id = genId();
  return {
    type: ActionTypes.OPERATION_FAIL,
    payload: operation
  };
};
