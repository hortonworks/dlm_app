import { type, requestType } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { Policy, PolicyPayload } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_POLICIES: requestType('LOAD_POLICIES'),
  CREATE_POLICY: requestType('CREATE_POLICY'),
  DELETE_POLICY: requestType('DELETE_POLICY'),
  SUSPEND_POLICY: requestType('SUSPEND_POLICY'),
  RESUME_POLICY: requestType('RESUME_POLICY')
};

export const loadPolicies = (requestId?): Action => ({type: ActionTypes.LOAD_POLICIES.START, payload: { meta: {requestId}}});
export const loadPoliciesSuccess = (policies, meta): ActionSuccess => {
  policies.policies = policies.policies.map(preparePolicy);
  return {type: ActionTypes.LOAD_POLICIES.SUCCESS, payload: {response: policies, meta}};
};

export const loadPoliciesFail = (error, meta): ActionFailure => ({
  type: ActionTypes.LOAD_POLICIES.FAILURE, payload: {error, meta}
});

export const createPolicy = (policy: PolicyPayload, targetClusterId: string|number, requestId?: string): Action => ({
  type: ActionTypes.CREATE_POLICY.START, payload: { policy, targetClusterId, meta: {requestId} }
});

export const createPolicySuccess = (creationStatus, meta): ActionSuccess => ({
  type: ActionTypes.CREATE_POLICY.SUCCESS, payload: {response: creationStatus, meta}
});
export const createPolicyFail = (error, meta): ActionFailure => ({type: ActionTypes.CREATE_POLICY.FAILURE, payload: {error, meta}});

export const deletePolicy = (payload: Policy, meta?): Action => ({type: ActionTypes.DELETE_POLICY.START, payload});
export const deletePolicySuccess = (id): Action => ({type: ActionTypes.DELETE_POLICY.SUCCESS, payload: id});
export const deletePolicyFail = (error): Action => ({type: ActionTypes.DELETE_POLICY.FAILURE, payload: error});

export const suspendPolicy = (payload: Policy, meta?): Action => ({type: ActionTypes.SUSPEND_POLICY.START, payload});
export const suspendPolicySuccess = (id): Action => ({type: ActionTypes.SUSPEND_POLICY.SUCCESS, payload: id});
export const suspendPolicyFail = (error): Action => ({type: ActionTypes.SUSPEND_POLICY.FAILURE, payload: error});

export const resumePolicy = (payload: Policy, meta?): Action => ({type: ActionTypes.RESUME_POLICY.START, payload});
export const resumePolicySuccess = (id): Action => ({type: ActionTypes.RESUME_POLICY.SUCCESS, payload: id});
export const resumePolicyFail = (error): Action => ({type: ActionTypes.RESUME_POLICY.FAILURE, payload: error});

function preparePolicy(policy) {
  policy.id = policy.name;
  return policy;
}
