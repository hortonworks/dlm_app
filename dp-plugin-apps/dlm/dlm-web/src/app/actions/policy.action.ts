/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type, requestType } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { Policy, PolicyPayload } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_POLICIES: requestType('LOAD_POLICIES'),
  CREATE_POLICY: requestType('CREATE_POLICY'),
  DELETE_POLICY: requestType('DELETE_POLICY'),
  SUSPEND_POLICY: requestType('SUSPEND_POLICY'),
  RESUME_POLICY: requestType('RESUME_POLICY'),
  LOAD_LAST_JOBS: requestType('LOAD_JOBS_FOR_POLICY')
};

export const loadPolicies = (queryParams = {}, meta = {}): Action => ({
  type: ActionTypes.LOAD_POLICIES.START,
  payload: {meta, queryParams}
});
export const loadPoliciesSuccess = (policies, meta): ActionSuccess => ({
  type: ActionTypes.LOAD_POLICIES.SUCCESS,
  payload: {response: policies, meta}
});

export const loadPoliciesFail = (error, meta): ActionFailure => ({
  type: ActionTypes.LOAD_POLICIES.FAILURE, payload: {error, meta}
});

export const createPolicy = (policy: PolicyPayload, targetClusterId: string|number, meta = {}): Action => ({
  type: ActionTypes.CREATE_POLICY.START, payload: { policy, targetClusterId, meta }
});

export const createPolicySuccess = (creationStatus, meta): ActionSuccess => ({
  type: ActionTypes.CREATE_POLICY.SUCCESS, payload: {response: creationStatus, meta}
});
export const createPolicyFail = (error, meta): ActionFailure => ({type: ActionTypes.CREATE_POLICY.FAILURE, payload: {error, meta}});

export const deletePolicy = (policy: Policy, meta = {}): Action => ({
  type: ActionTypes.DELETE_POLICY.START, payload: {policy, meta}
});
export const deletePolicySuccess = (policyId, meta): ActionSuccess => ({
  type: ActionTypes.DELETE_POLICY.SUCCESS, payload: {response: policyId, meta}
});
export const deletePolicyFail = (error, meta): ActionFailure => ({
  type: ActionTypes.DELETE_POLICY.FAILURE, payload: {error, meta}
});

export const suspendPolicy = (policy: Policy, meta = {}): Action => ({
  type: ActionTypes.SUSPEND_POLICY.START, payload: {policy, meta}
});
export const suspendPolicySuccess = (policyId, meta): ActionSuccess => ({
  type: ActionTypes.SUSPEND_POLICY.SUCCESS, payload: {response: policyId, meta}
});
export const suspendPolicyFail = (error, meta): ActionFailure => ({
  type: ActionTypes.SUSPEND_POLICY.FAILURE, payload: {error, meta}
});

export const resumePolicy = (policy: Policy, meta = {}): Action => ({
  type: ActionTypes.RESUME_POLICY.START, payload: {policy, meta}
});
export const resumePolicySuccess = (policyId, meta): ActionSuccess => ({
  type: ActionTypes.RESUME_POLICY.SUCCESS, payload: {response: policyId, meta}
});
export const resumePolicyFail = (error, meta): ActionFailure => ({
  type: ActionTypes.RESUME_POLICY.FAILURE, payload: {error, meta}
});

export const loadLastJobs = ({policies, numJobs = 3}: {policies: Policy[], numJobs?: number}, meta = {}): Action => ({
  type: ActionTypes.LOAD_LAST_JOBS.START,
  payload: {policies, numJobs, meta}
});

export const loadLastJobsSuccess = (jobs, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_LAST_JOBS.SUCCESS,
  payload: {response: jobs, meta}
});

export const loadLastJobsFailure = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_LAST_JOBS.FAILURE,
  payload: {error}
});
