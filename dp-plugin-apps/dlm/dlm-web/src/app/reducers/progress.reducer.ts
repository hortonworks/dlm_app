/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionWithPayload } from 'actions/actions.type';
import { BaseState } from 'models/base-resource-state';
import { ProgressState } from 'models/progress-state.model';
import { mapToList, toEntities } from 'utils/store-util';
import {
  isSuccessAction, isStartAction, isFailureAction, isRequestAction, isCompletedAction, originalActionName
} from 'utils/type-action';
import { ActionTypes } from 'actions/progress.action';
import { omit } from 'utils/object-utils';

export type State = BaseState<ProgressState>;

export const initialState: State = {
  entities: {}
};

const makeProgressInstance = (requestId, action: ActionWithPayload<any>): ProgressState => ({
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
      error: false,
      response: null
    };
  }
  if (isSuccessAction(action)) {
    return <ProgressState>{
      ...request,
      isInProgress: false,
      success: true,
      error: false,
      response: action.payload.response && JSON.parse(JSON.stringify(action.payload.response))
    };
  }
  if (isFailureAction(action)) {
    return <ProgressState>{
      ...request,
      isInProgress: false,
      success: false,
      error: true,
      errorMessage: action.payload.error,
      response: null,
      status: action.payload.error.status
    };
  }
  return request;
};

export function reducer(state = initialState, action: ActionWithPayload<any>): State {
  switch (action.type) {
    case ActionTypes.RESET_PROGRESS_STATE: {
      const entityId = action.payload.requestId;
      return {
        entities: {
          ...state.entities,
          [entityId]: makeProgressInstance(entityId, action)
        }
      };
    }
    case ActionTypes.UPDATE_PROGRESS_STATE: {
      const { progressState } = action.payload;
      const entityId = action.payload.requestId;
      const progressEntity = state.entities[entityId] || makeProgressInstance(entityId, action);
      return {
        entities: {
          ...state.entities,
          [entityId]: {
            ...progressEntity,
            ...progressState
          }
        }
      };
    }
    case ActionTypes.REMOVE_PROGRESS_STATE: {
      return {
        entities: {
          ...omit(state.entities, ...action.payload.requestIds)
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
    const requests = mapToList(state.entities).reduce((allRequests, _request) => {
      if (_request.actionType === originalActionName(action)) {
        return allRequests.concat(updateLoadingProgress(_request, action));
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
