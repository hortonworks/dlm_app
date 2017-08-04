/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Action } from '@ngrx/store';
import { BaseState } from 'models/base-resource-state';
import { ProgressState } from 'models/progress-state.model';
import { mapToList, toEntities } from 'utils/store-util';
import {
  isSuccessAction, isStartAction, isFailureAction, isRequestAction, isCompletedAction, originalActionName
} from 'utils/type-action';
import { ActionTypes } from 'actions/progress.action';

export type State = BaseState<ProgressState>;

export const initialState: State = {
  entities: {}
};

const makeProgressInstance = (requestId, action: Action): ProgressState => ({
  isInProgress: false,
  error: false,
  success: false,
  actionType: originalActionName(action),
  created: Date.now(),
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
          [requestId]: makeProgressInstance(requestId, action)
        }
      };
    }
    case ActionTypes.UPDATE_PROGRESS_STATE: {
      const { requestId, progressState } = action.payload;
      const progressEntity = state.entities[requestId] || makeProgressInstance(requestId, action);
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
  // check if dispatched action is completed action (e.g SUCCESS, FAILURE) and update all entities marked with
  // dispatched action name as completed. This hack is present because of nature angular's http service which emits
  // response object once per several request sent within very short interval (kinda "one run cycle")
  if (!action.type) {
    return state;
  }
  if (isCompletedAction(action)) {
    const requests = mapToList(state.entities).reduce((allRequests, request) => {
      if (request.actionType === originalActionName(action)) {
        return allRequests.concat(updateLoadingProgress(request, action));
      }
      return allRequests;
    }, []);
    if (requests.length) {
      return {
        entities: {
          ...state.entities,
          ...toEntities<ProgressState>(requests, 'requestId')
        }
      };
    }
  }
  if (!(action.payload && action.payload.meta && action.payload.meta.requestId)) {
    return state;
  }
  const {meta: {requestId}} = action.payload;
  const request = state.entities[requestId] || makeProgressInstance(requestId, action);
  return {
    entities: {
      ...state.entities,
      [requestId]: updateLoadingProgress(request, action)
    }
  };
}
