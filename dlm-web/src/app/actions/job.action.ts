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
