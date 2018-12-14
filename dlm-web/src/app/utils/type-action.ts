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

import { isDevMode } from '@angular/core';

import { StoreAction } from 'actions/actions.type';
import { capitalize } from 'utils/string-utils';

export const START_MARKER = '[REQUEST_START]';
export const SUCCESS_MARKER = '[REQUEST_SUCCESS]';
export const FAILURE_MARKER = '[REQUEST_FAIL]';

export interface RequestAction {
  START: string;
  SUCCESS: string;
  FAILURE: string;
  _NAME: string;
}

const actionsCache: { [actionName: string]: boolean} = {};
export function type<T>(actionName: T | ''): T {
  if (actionsCache[<string>actionName]) {
    if (isDevMode()) {
      throw new Error(`Action "${actionName}" already defined`);
    }
  }
  actionsCache[<string>actionName] = true;

  return <T>actionName;
}

export const requestType = (actionName: string): RequestAction => ({
  START: type(`${actionName} ${START_MARKER}`),
  SUCCESS: type(`${actionName} ${SUCCESS_MARKER}`),
  FAILURE: type(`${actionName} ${FAILURE_MARKER}`),
  _NAME: actionName
});

export const isAction = (action: StoreAction) => action && typeof action.type === 'string' && action.type in actionsCache;
export const isStartAction = (action: StoreAction): boolean => isAction(action) && action.type.endsWith(START_MARKER);
export const isSuccessAction = (action: StoreAction): boolean => isAction(action) && action.type.endsWith(SUCCESS_MARKER);
export const isFailureAction = (action: StoreAction): boolean => isAction(action) && action.type.endsWith(FAILURE_MARKER);
export const isCompletedAction = (action: StoreAction): boolean => isFailureAction(action) || isSuccessAction(action);
export const isRequestAction = (action: StoreAction): boolean => isCompletedAction(action) || isStartAction(action);
export const originalActionName = (action: StoreAction): string => {
  const splitted = action.type.split(' ');
  if (!isRequestAction(action)) {
    return null;
  }
  return splitted.slice(0, splitted.length - 1).join(' ');
};

const actionNameToMethod = (actionName: string): string => actionName.split('_').reduce((acc: string, part: string, index: number) => {
  const converted = index === 0 ? part.toLocaleLowerCase() : capitalize(part);
  return acc + converted;
}, '');

type RequestActionFn = (...args: any[]) => any;
export interface RequestActionBody {
  start?: RequestActionFn;
  success?: RequestActionFn;
  failure?: RequestActionFn;
}
export interface RequestActions {
  [method: string]: RequestActionFn;
}

const startActionDefault = (...args) => ({ args });
const successActionDefault = (response, meta = {}) => ({
  response, meta
});
const failureActionDefault = (error, meta = {}) => ({
  error,
  meta
});

const makeRequestActions = (requestAction: RequestAction) => ({
  start: (startFn = startActionDefault) => (...args) => ({
    type: requestAction.START,
    payload: startFn ? startFn.apply(null, args) : {}
  }),
  success: (successFn = successActionDefault) => (...args) => ({
    type: requestAction.SUCCESS,
    payload: successFn.apply(null, args)
  }),
  failure: (failureFn = failureActionDefault) => (...args) => ({
    type: requestAction.FAILURE,
    payload: failureFn.apply(null, args)
  })
});

/**
 * TODO: more comments and examples. Please see tests to get some insights
 */
export const createRequestAction = (requestAction: RequestAction, { start, success, failure }: RequestActionBody = {}): RequestActions => {
  const actionMethod = actionNameToMethod(requestAction._NAME);
  const successMethod = actionMethod + 'Success';
  const failureMethod = actionMethod + 'Failure';
  const actions = makeRequestActions(requestAction);
  return {
    [actionMethod]: actions.start(start),
    [successMethod]: actions.success(success),
    [failureMethod]: actions.failure(failure)
  };
};
