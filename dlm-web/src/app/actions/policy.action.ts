/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { type, requestType } from 'utils/type-action';
import { ActionWithPayload } from 'actions/actions.type';
import { Policy, PolicyPayload } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_POLICIES: requestType('LOAD_POLICIES'),
  CREATE_POLICY: requestType('CREATE_POLICY'),
  DELETE_POLICY: requestType('DELETE_POLICY'),
  SUSPEND_POLICY: requestType('SUSPEND_POLICY'),
  RESUME_POLICY: requestType('RESUME_POLICY'),
  LOAD_LAST_JOBS: requestType('LOAD_JOBS_FOR_POLICY'),
  WIZARD_SAVE_STEP: type('WIZARD_SAVE_STEP'),
  WIZARD_MOVE_TO_STEP: type('WIZARD_MOVE_TO_STEP'),
  WIZARD_RESET_ALL_STEPS: type('WIZARD_RESET_ALL_STEPS'),
  WIZARD_RESET_STEP: type('WIZARD_RESET_STEP'),
  VALIDATE_POLICY: requestType('VALIDATE_POLICY')
};

export const loadPolicies = (queryParams = {}, meta = {}): ActionWithPayload<any> => ({
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

export const createPolicy = (policy: PolicyPayload, targetClusterId: string|number, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.CREATE_POLICY.START, payload: { policy, targetClusterId, meta }
});

export const createPolicySuccess = (creationStatus, meta): ActionSuccess => ({
  type: ActionTypes.CREATE_POLICY.SUCCESS, payload: {response: creationStatus, meta}
});
export const createPolicyFail = (error, meta): ActionFailure => ({type: ActionTypes.CREATE_POLICY.FAILURE, payload: {error, meta}});

export const deletePolicy = (policy: Policy, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.DELETE_POLICY.START, payload: {policy, meta}
});
export const deletePolicySuccess = (policyId, meta): ActionSuccess => ({
  type: ActionTypes.DELETE_POLICY.SUCCESS, payload: {response: policyId, meta}
});
export const deletePolicyFail = (error, meta): ActionFailure => ({
  type: ActionTypes.DELETE_POLICY.FAILURE, payload: {error, meta}
});

export const suspendPolicy = (policy: Policy, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.SUSPEND_POLICY.START, payload: {policy, meta}
});
export const suspendPolicySuccess = (policyId, meta): ActionSuccess => ({
  type: ActionTypes.SUSPEND_POLICY.SUCCESS, payload: {response: policyId, meta}
});
export const suspendPolicyFail = (error, meta): ActionFailure => ({
  type: ActionTypes.SUSPEND_POLICY.FAILURE, payload: {error, meta}
});

export const resumePolicy = (policy: Policy, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.RESUME_POLICY.START, payload: {policy, meta}
});
export const resumePolicySuccess = (policyId, meta): ActionSuccess => ({
  type: ActionTypes.RESUME_POLICY.SUCCESS, payload: {response: policyId, meta}
});
export const resumePolicyFail = (error, meta): ActionFailure => ({
  type: ActionTypes.RESUME_POLICY.FAILURE, payload: {error, meta}
});

export const loadLastJobs = ({policies, numJobs = 3}: {policies: Policy[], numJobs?: number}, meta = {}): ActionWithPayload<any> => ({
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

export const wizardSaveStep = (stepId, value): ActionWithPayload<any> => ({
  type: ActionTypes.WIZARD_SAVE_STEP,
  payload: {stepId, value}
});

export const wizardResetAllSteps = (): ActionWithPayload<any> => ({
  type: ActionTypes.WIZARD_RESET_ALL_STEPS,
  payload: {}
});

export const wizardResetStep = (stepId): ActionWithPayload<any> => ({
  type: ActionTypes.WIZARD_RESET_STEP,
  payload: {stepId}
});

export const wizardMoveToStep = (stepId: string): ActionWithPayload<any> => ({
  type: ActionTypes.WIZARD_MOVE_TO_STEP,
  payload: {stepId}
});

export const validatePolicy = (data, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.VALIDATE_POLICY.START,
  payload: {data, meta}
});

export const validatePolicySuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.VALIDATE_POLICY.SUCCESS,
  payload: { response, meta }
});

export const validatePolicyFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.VALIDATE_POLICY.FAILURE,
  payload: { error, meta }
});
