import { Action } from '@ngrx/store';
import { type } from 'utils/type-action';

export const ActionTypes = {
  RESET_PROGRESS_STATE: type('RESET_PROGRESS_STATE')
};

export const resetProgressState = (requestId): Action => ({ type: ActionTypes.RESET_PROGRESS_STATE, payload: {requestId}});
