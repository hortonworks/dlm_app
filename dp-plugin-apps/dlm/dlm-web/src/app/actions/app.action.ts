import { Action } from '@ngrx/store';
import { type } from 'utils/type-action';

export const ActionTypes = {
  INIT_APP: type('INIT_APP'),
  NOOP: type('NOOP')
};

export const initApp = (): Action => ({ type: ActionTypes.INIT_APP });
export const noop = (): Action => ({ type: ActionTypes.NOOP });
