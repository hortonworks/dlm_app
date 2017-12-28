/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type, requestType } from '../utils/type-action';
import { ActionWithPayload } from 'actions/actions.type';
import { Policy } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_JOBS: requestType('LOAD_JOBS'),
  LOAD_JOBS_FOR_CLUSTERS: type('LOAD_JOBS_FOR_CLUSTERS'),
  LOAD_JOBS_FOR_POLICY: type('LOAD_JOBS_FOR_POLICY'),
  LOAD_JOBS_PAGE_FOR_POLICY: requestType('LOAD_JOBS_PAGE_FOR_POLICY'),
  ABORT_JOB: requestType('ABORT_JOB'),
  RERUN_JOB: requestType('RERUN_JOB')
};

export const loadJobs = (requestId?): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_JOBS.START, payload: { meta: {requestId} }
});

export const loadJobsForClusters = (clusterIds: number[], requestId?): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_JOBS_FOR_CLUSTERS, payload: {clusterIds, meta: {requestId}}
});

export const loadJobsForPolicy = (policy: Policy): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_JOBS_FOR_POLICY, payload: policy
});
export const loadJobsSuccess = (jobs, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_JOBS.SUCCESS, payload: {response: jobs, meta}
});

export const loadJobsPageForPolicy =
  (policy: Policy, offset, sortBy, pageSize = 10, filters = []): ActionWithPayload<any> => ({
    type: ActionTypes.LOAD_JOBS_PAGE_FOR_POLICY.START,
    payload: {
      policy,
      meta: {
        offset, pageSize, policyId: policy.id, sortBy, filters
      }
    }
  });

export const loadJobsPageForPolicySuccess = (jobs, meta): ActionSuccess => ({
  type: ActionTypes.LOAD_JOBS_PAGE_FOR_POLICY.SUCCESS,
  payload: {response: jobs, meta}
});

export const loadJobsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_JOBS.FAILURE, payload: {error, meta}});
export const abortJob = (policy: Policy, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.ABORT_JOB.START, payload: { policy, meta }
});
export const abortJobSuccess = (response, meta): ActionSuccess => ({type: ActionTypes.ABORT_JOB.SUCCESS, payload: {response, meta}});
export const abortJobFailure = (error, meta): ActionFailure => ({type: ActionTypes.ABORT_JOB.FAILURE, payload: {error, meta}});

export const rerunJob = (policy: Policy, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.RERUN_JOB.START, payload: { policy, meta }
});
export const rerunJobSuccess = (response, meta): ActionSuccess => ({type: ActionTypes.RERUN_JOB.SUCCESS, payload: {response, meta}});
export const rerunJobFailure = (error, meta): ActionFailure => ({type: ActionTypes.RERUN_JOB.FAILURE, payload: {error, meta}});
