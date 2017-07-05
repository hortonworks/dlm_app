import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { Policy } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_JOBS: requestType('LOAD_JOBS'),
  LOAD_JOBS_FOR_CLUSTERS: type('LOAD_JOBS_FOR_CLUSTERS'),
  LOAD_JOBS_FOR_POLICY: type('LOAD_JOBS_FOR_POLICY'),
  ABORT_JOB: requestType('ABORT_JOB')
};

export const loadJobs = (requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS.START, payload: { meta: {requestId} }
});

export const loadJobsForClusters = (clusterIds: number[], requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS_FOR_CLUSTERS, payload: {clusterIds, meta: {requestId}}
});

export const loadJobsForPolicy = (policy: Policy): Action => ({type: ActionTypes.LOAD_JOBS_FOR_POLICY, payload: policy});

export const loadJobsSuccess = (jobs, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_JOBS.SUCCESS, payload: {response: jobs, meta}
});

export const loadJobsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_JOBS.FAILURE, payload: {error, meta}});
export const abortJob = (policy: Policy): Action => ({type: ActionTypes.ABORT_JOB.START, payload: {policy}});
export const abortJobSuccess = (response): ActionSuccess => ({type: ActionTypes.ABORT_JOB.SUCCESS, payload: {response}});
export const abortJobFailure = (error): ActionFailure => ({type: ActionTypes.ABORT_JOB.FAILURE, payload: {error}});
