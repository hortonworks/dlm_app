import { Action } from '@ngrx/store';
import { type } from 'utils/type-action';

export const ActionTypes = {
  RESET_PROGRESS_STATE: type('RESET_PROGRESS_STATE'),
  UPDATE_PROGRESS_STATE: type('UPDATE_PROGRESS_STATE')
};

export const resetProgressState = (requestId): Action => ({ type: ActionTypes.RESET_PROGRESS_STATE, payload: {requestId}});
export const updateProgressState = (requestId, progressState): Action => ({
  type: ActionTypes.UPDATE_PROGRESS_STATE,
  payload: {requestId, progressState}
});
