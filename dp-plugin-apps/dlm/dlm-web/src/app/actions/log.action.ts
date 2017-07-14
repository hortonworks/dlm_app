import { requestType } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import { EntityType } from 'constants/log.constant';
export const ActionTypes = {
  LOAD_LOGS: requestType('LOAD_LOGS')
};

export const loadLogs = (clusterId: number, instanceId: string, logType: EntityType, requestId?): Action => ({
  type: ActionTypes.LOAD_LOGS.START, payload: { clusterId, instanceId, logType, meta: {requestId, instanceId} }
});

export const loadLogsSuccess = (logs, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_LOGS.SUCCESS, payload: {response: logs, meta}
});

export const loadLogsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_LOGS.FAILURE, payload: {error, meta}});
