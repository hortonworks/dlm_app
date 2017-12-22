/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type, requestType } from '../utils/type-action';
import { ActionWithPayload } from 'actions/actions.type';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LIST_FILES: requestType('LIST_FILES')
};

export const listFiles = (clusterId, path, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LIST_FILES.START, payload: { clusterId, path, meta }
});

export const listFilesSuccess = (listStatuses, meta = {}): ActionSuccess => {
  return {type: ActionTypes.LIST_FILES.SUCCESS, payload: {response: listStatuses, meta}};
};

export const listFilesFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LIST_FILES.FAILURE, payload: {error, meta}});
