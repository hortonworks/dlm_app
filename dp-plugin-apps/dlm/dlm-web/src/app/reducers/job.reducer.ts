/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Job } from 'models/job.model';
import { BaseState } from 'models/base-resource-state';
import * as fromJob from 'actions/job.action';
import * as fromPolicy from 'actions/policy.action';
import { toEntities } from 'utils/store-util';

export type State = BaseState<Job>;

export const initialState: State = {
  entities: {},
  queries: {
    lastResultIds: [],
    overallRecords: 0,
    offset: 0,
    pageSize: 0,
    policyId: null
  }
};

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
  return {
    queries: {...state.queries},
    entities: {
      ...state.entities,
      ...toEntities<Job>(jobs)
    }
  };
}

function loadLastJobsSuccess(state = initialState, action): State {
  const jobs = action.payload.response.jobs;
  return {
    queries: {...state.queries},
    entities: {
      ...state.entities,
      ...toEntities<Job>(jobs)
    }
  };
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
    queries,
    entities: {
      ...state.entities,
      ...toEntities<Job>(jobs)
    }
  };
}

function loadPoliciesSuccess(state = initialState, action): State {
  const policies = action.payload.response.policies;
  const jobs = policies.reduce((allJobs, policy) => allJobs.concat(policy.jobs), []);
  return {
    queries: {...state.queries},
    entities: {
      ...state.entities,
      ...toEntities<Job>(jobs)
    }
  };
}
