import { type } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { Policy } from '../models/policy.model';

export const ActionTypes = {
  LOAD_POLICIES: type('LOAD_POLICIES'),
  LOAD_POLICIES_SUCCESS: type('LOAD_POLICIES_SUCCESS'),
  LOAD_POLICIES_FAILURE: type('LOAD_POLICIES_FAILURE')
};

export class LoadPolicies implements Action {
  type = ActionTypes.LOAD_POLICIES;

  constructor(public payload?: string) {}
};

export class LoadPoliciesSuccess implements Action {
  type = ActionTypes.LOAD_POLICIES_SUCCESS;

  constructor(public payload: any) {}
};

export class LoadPoliciesFailure implements Action {
  type = ActionTypes.LOAD_POLICIES_FAILURE;

  constructor(public payload: string) {}
};

export type Actions
  = LoadPolicies
  | LoadPoliciesSuccess
  | LoadPoliciesFailure;
