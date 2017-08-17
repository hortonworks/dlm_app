/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Action } from '@ngrx/store';
import { isDevMode } from '@angular/core';

export const START_MARKER = '[REQUEST_START]';
export const SUCCESS_MARKER = '[REQUEST_SUCCESS]';
export const FAILURE_MARKER = '[REQUEST_FAIL]';

export interface RequestAction {
  START: string;
  SUCCESS: string;
  FAILURE: string;
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
  FAILURE: type(`${actionName} ${FAILURE_MARKER}`)
});

export const isAction = (action: Action) => action && typeof action.type === 'string' && action.type in actionsCache;
export const isStartAction = (action: Action): boolean => isAction(action) && action.type.endsWith(START_MARKER);
export const isSuccessAction = (action: Action): boolean => isAction(action) && action.type.endsWith(SUCCESS_MARKER);
export const isFailureAction = (action: Action): boolean => isAction(action) && action.type.endsWith(FAILURE_MARKER);
export const isCompletedAction = (action: Action): boolean => isFailureAction(action) || isSuccessAction(action);
export const isRequestAction = (action: Action): boolean => isCompletedAction(action) || isStartAction(action);
export const originalActionName = (action: Action): string => {
  const splitted = action.type.split(' ');
  if (!isRequestAction(action)) {
    return null;
  }
  return splitted.slice(0, splitted.length - 1).join(' ');
};
