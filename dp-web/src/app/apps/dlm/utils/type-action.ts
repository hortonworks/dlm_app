import { isDevMode } from '@angular/core';

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
