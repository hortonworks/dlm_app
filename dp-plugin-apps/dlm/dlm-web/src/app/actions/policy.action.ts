import { type, requestType } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { PolicyPayload } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_POLICIES: requestType('LOAD_POLICIES'),
  CREATE_POLICY: type('CREATE_POLICY'),
  CREATE_POLICY_SUCCESS: type('CREATE_POLICY_SUCCESS'),
  CREATE_POLICY_FAIL: type('CREATE_POLICY_FAIL')
};

export const loadPolicies = (requestId?): Action => ({type: ActionTypes.LOAD_POLICIES.START, payload: { meta: {requestId}}});
export const loadPoliciesSuccess = (policies, meta): ActionSuccess => {
  policies.policies = policies.policies.map(preparePolicy);
  return {type: ActionTypes.LOAD_POLICIES.SUCCESS, payload: {response: policies, meta}};
};

export const loadPoliciesFail = (error, meta): ActionFailure => ({
  type: ActionTypes.LOAD_POLICIES.FAILURE, payload: {error, meta}
});

export const createPolicy = (policy: PolicyPayload, targetClusterId: string|number): Action => ({
  type: ActionTypes.CREATE_POLICY, payload: { policy, targetClusterId }
});

export const createPolicySuccess = (payload): Action => ({type: ActionTypes.CREATE_POLICY_SUCCESS, payload});
export const createPolicyFail = (error): Action => ({type: ActionTypes.CREATE_POLICY_FAIL, payload: error});

function preparePolicy(policy) {
  policy.id = policy.name;
  return policy;
}
