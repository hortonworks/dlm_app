import { type } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { PolicyPayload } from 'models/policy.model';

export const ActionTypes = {
  LOAD_POLICIES: type('LOAD_POLICIES'),
  LOAD_POLICIES_SUCCESS: type('LOAD_POLICIES_SUCCESS'),
  LOAD_POLICIES_FAIL: type('LOAD_POLICIES_FAIL'),
  CREATE_POLICY: type('CREATE_POLICY'),
  CREATE_POLICY_SUCCESS: type('CREATE_POLICY_SUCCESS'),
  CREATE_POLICY_FAIL: type('CREATE_POLICY_FAIL')
};

export const loadPolicies = (): Action => ({type: ActionTypes.LOAD_POLICIES});
export const loadPoliciesSuccess = (policies): Action => {
  policies.policies = policies.policies.map(preparePolicy);
  return {type: ActionTypes.LOAD_POLICIES_SUCCESS, payload: policies};
};
export const loadPoliciesFail = (error): Action => ({type: ActionTypes.LOAD_POLICIES_FAIL});

export const createPolicy = (policy: PolicyPayload, targetClusterId: string|number): Action => ({
  type: ActionTypes.CREATE_POLICY, payload: { policy, targetClusterId }
});
export const createPolicySuccess = (payload): Action => ({type: ActionTypes.CREATE_POLICY_SUCCESS, payload});
export const createPolicyFail = (error): Action => ({type: ActionTypes.CREATE_POLICY_FAIL, payload: error});

function preparePolicy(policy) {
  policy.id = policy.name;
  return policy;
}
