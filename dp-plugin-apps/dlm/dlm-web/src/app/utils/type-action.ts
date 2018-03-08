/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { isDevMode } from '@angular/core';
import { Action } from '@ngrx/store';

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
