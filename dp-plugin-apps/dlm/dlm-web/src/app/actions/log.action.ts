/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { requestType } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import { EntityType } from 'constants/log.constant';
export const ActionTypes = {
  LOAD_LOGS: requestType('LOAD_LOGS')
};

export const loadLogs = (clusterId: number, instanceId: string, logType: EntityType, requestId?, timestamp = ''): Action => ({
  type: ActionTypes.LOAD_LOGS.START, payload: { clusterId, instanceId, logType, meta: {requestId, instanceId, timestamp} }
});

export const loadLogsSuccess = (logs, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_LOGS.SUCCESS, payload: {response: logs, meta}
});

export const loadLogsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_LOGS.FAILURE, payload: {error, meta}});
