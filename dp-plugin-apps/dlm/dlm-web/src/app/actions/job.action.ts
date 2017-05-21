import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { JOB_STATUS } from 'constants/status.constant';
import { Policy } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_JOBS: requestType('LOAD_JOBS'),
  LOAD_JOBS_FOR_CLUSTERS: type('LOAD_JOBS_FOR_CLUSTERS'),
  LOAD_JOBS_FOR_POLICY: type('LOAD_JOBS_FOR_POLICY'),
  LOAD_JOBS_SUCCESS: type('LOAD_JOBS_SUCCESS'),
  LOAD_JOBS_FAIL: type('LOAD_JOBS_FAIL')
};

export const loadJobs = (requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS.START, payload: { meta: {requestId} }
});

export const loadJobsForClusters = (clusterIds: string[], requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS_FOR_CLUSTERS, payload: {clusterIds, meta: {requestId}}
});

export const loadJobsForPolicy = (policy: Policy): Action => ({type: ActionTypes.LOAD_JOBS_FOR_POLICY, payload: policy});

export const loadJobsSuccess = (jobs, meta = {}): ActionSuccess => {
  jobs.jobs = jobs.jobs.map(job => prepareJob(job));
  return {type: ActionTypes.LOAD_JOBS.SUCCESS, payload: {response: jobs, meta}};
};

export const loadJobsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_JOBS.FAILURE, payload: {error, meta}});

function prepareJob(job) {
  job.startTime = new Date(job.startTime).getTime();
  job.endTime = new Date(job.endTime).getTime();
  job.duration = job.endTime > 0 ? job.endTime - job.startTime : -1;
  job.isCompleted = job.status !== JOB_STATUS.IN_PROGRESS;
  return job;
}
