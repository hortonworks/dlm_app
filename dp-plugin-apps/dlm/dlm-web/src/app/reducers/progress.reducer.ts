import { Action } from '@ngrx/store';
import { BaseState } from 'models/base-resource-state';
import { ProgressState } from 'models/progress-state.model';
import { isSuccessAction, isStartAction, isFailureAction } from 'utils/type-action';
import { ActionTypes } from 'actions/progress.action';

export type State = BaseState<ProgressState>;

export const initialState: State = {
  entities: {}
};

const makeProgressInstance = (requestId): ProgressState => ({
  isInProgress: false,
  error: false,
  success: false,
  requestId
});

export const updateLoadingProgress = (request: ProgressState, action): ProgressState => {
  if (isStartAction(action)) {
    return <ProgressState>{
      ...request,
      isInProgress: true,
      success: false,
      error: false
    };
  }
  if (isSuccessAction(action)) {
    return <ProgressState>{
      ...request,
      isInProgress: false,
      success: true,
      error: false
    };
  }
  if (isFailureAction(action)) {
    return <ProgressState>{
      ...request,
      isInProgress: false,
      success: false,
      error: true,
      errorMessage: action.payload.error
    };
  }
  return request;
};

export function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypes.RESET_PROGRESS_STATE: {
      const {requestId} = action.payload;
      return {
        entities: {
          ...state.entities,
          [requestId]: makeProgressInstance(requestId)
        }
      };
    }
    case ActionTypes.UPDATE_PROGRESS_STATE: {
      const { requestId, progressState } = action.payload;
      const progressEntity = state.entities[requestId] || makeProgressInstance(requestId);
      return {
        entities: {
          ...state.entities,
          [requestId]: {
            ...progressEntity,
            ...progressState
          }
        }
      };
    }
  }
  if (!(action.payload && action.payload.meta && action.payload.meta.requestId)) {
    return state;
  }
  const {meta: {requestId}} = action.payload;
  const request = state.entities[requestId] || makeProgressInstance(requestId);
  return {
    entities: {
      ...state.entities,
      [requestId]: updateLoadingProgress(request, action)
    }
  };
}
