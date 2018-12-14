/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { ActionWithPayload } from 'actions/actions.type';
import { BaseState } from 'models/base-resource-state';
import { ProgressState } from 'models/progress-state.model';
import { mapToList, toEntities } from 'utils/store-util';
import {
  isSuccessAction, isStartAction, isFailureAction, isCompletedAction, originalActionName
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
  payload: action.payload,
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
      response: action.payload.response && JSON.parse(JSON.stringify(action.payload.response)),
      status: 200
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
