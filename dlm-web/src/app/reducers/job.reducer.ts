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

import { Job } from 'models/job.model';
import * as fromJob from 'actions/job.action';
import * as fromPolicy from 'actions/policy.action';
import { Policy } from 'models/policy.model';
import { isJobRunning } from 'utils/policy-util';
import { EntityState, createEntityAdapter, EntityAdapter, Update } from '@ngrx/entity';

export interface State extends EntityState<Job> {
  queries: any;
}

export const jobAdapter: EntityAdapter<Job> = createEntityAdapter();

export const initialState: State = jobAdapter.getInitialState({
  entities: {},
  queries: {
    lastResultIds: [],
    overallRecords: 0,
    offset: 0,
    pageSize: 0,
    policyId: null
  }
});

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromJob.ActionTypes.LOAD_JOBS.SUCCESS:
      return loadJobsSuccess(state, action);
    case fromPolicy.ActionTypes.LOAD_LAST_JOBS.SUCCESS:
      return loadLastJobsSuccess(state, action);
    case fromPolicy.ActionTypes.LOAD_POLICIES.SUCCESS:
      return loadPoliciesSuccess(state, action);
    case fromJob.ActionTypes.LOAD_JOBS_PAGE_FOR_POLICY.SUCCESS:
      return loadJobsPageSuccess(state, action);
    default:
      return state;
  }
}

function loadJobsSuccess(state = initialState, action): State {
  const jobs = action.payload.response.jobs;
  return jobAdapter.addMany(jobs, state);
}

function loadLastJobsSuccess(state = initialState, action): State {
  const jobs = action.payload.response.jobs;
  return jobAdapter.addMany(jobs, state);
}

function loadJobsPageSuccess(state = initialState, action): State {
  const jobs = action.payload.response.jobs;
  const {payload: {meta: {pageSize, offset, policyId}}} = action;
  const queries = {
    overallRecords: action.payload.response.totalResults,
    lastResultIds: jobs.map(j => j.id),
    policyId,
    pageSize,
    offset
  };

  return {
    ...jobAdapter.addMany(jobs, state),
    queries
  };
}

function loadPoliciesSuccess(state = initialState, action): State {
  const policies = action.payload.response.policies;
  const jobs: Update<Job>[] = [];
  policies.forEach((policy: Policy ) => {
    policy.jobs.forEach(job => {
      const jobId = job.id;
      if (isJobRunning(job) || jobId in state.entities && isJobRunning(state.entities[jobId])) {
        jobs.push({
          id: jobId,
          changes: job
        });
      }
    });
  });

  return jobAdapter.updateMany(jobs, state);
}
