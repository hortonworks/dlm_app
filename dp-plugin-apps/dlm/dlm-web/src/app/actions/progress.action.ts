/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionWithPayload } from 'actions/actions.type';
import { type } from 'utils/type-action';

export const ActionTypes = {
  RESET_PROGRESS_STATE: type('RESET_PROGRESS_STATE'),
  UPDATE_PROGRESS_STATE: type('UPDATE_PROGRESS_STATE'),
  REMOVE_PROGRESS_STATE: type('REMOVE_PROGRESS_STATE')
};

export const resetProgressState = (requestId): ActionWithPayload<any> => ({ type: ActionTypes.RESET_PROGRESS_STATE, payload: {requestId}});
export const updateProgressState = (requestId, progressState): ActionWithPayload<any> => ({
  type: ActionTypes.UPDATE_PROGRESS_STATE,
  payload: {requestId, progressState}
});
export const removeProgressState = (requestIds: string | string[]): ActionWithPayload<any> => ({
  type: ActionTypes.REMOVE_PROGRESS_STATE,
  payload: { requestIds: Array.isArray(requestIds) ? requestIds : [requestIds] }
});
