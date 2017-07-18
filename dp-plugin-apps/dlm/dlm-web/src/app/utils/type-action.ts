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

export const isStartAction = (action: Action): boolean => action.type.endsWith(START_MARKER);
export const isSuccessAction = (action: Action): boolean => action.type.endsWith(SUCCESS_MARKER);
export const isFailureAction = (action: Action): boolean => action.type.endsWith(FAILURE_MARKER);
export const isCompletedAction = (action: Action): boolean => isFailureAction(action) || isSuccessAction(action);
export const isRequestAction = (action: Action): boolean => isCompletedAction(action) || isStartAction(action);
export const originalActionName = (action: Action): string => {
  const splitted = action.type.split(' ');
  if (!isRequestAction(action)) {
    return null;
  }
  return splitted.slice(0, splitted.length - 1).join(' ');
};
