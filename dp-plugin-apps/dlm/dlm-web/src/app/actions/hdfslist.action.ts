import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LIST_FILES: requestType('LIST_FILES')
};

export const listFiles = (clusterId, path, meta = {}): Action => ({
  type: ActionTypes.LIST_FILES.START, payload: { clusterId, path, meta }
});

export const listFilesSuccess = (listStatuses, meta = {}): ActionSuccess => {
  return {type: ActionTypes.LIST_FILES.SUCCESS, payload: {response: listStatuses, meta}};
};

export const listFilesFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LIST_FILES.FAILURE, payload: {error, meta}});
