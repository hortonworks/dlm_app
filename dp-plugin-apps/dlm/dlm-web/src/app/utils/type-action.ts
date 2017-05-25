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

export const isStartAction = (action): boolean => action.type.endsWith(START_MARKER);
export const isSuccessAction = (action): boolean => action.type.endsWith(SUCCESS_MARKER);
export const isFailureAction = (action): boolean => action.type.endsWith(FAILURE_MARKER);
