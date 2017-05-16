import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { JOB_STATUS } from 'constants/status.constant';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_JOBS: requestType('LOAD_JOBS'),
  LOAD_JOBS_FOR_CLUSTERS: type('LOAD_JOBS_FOR_CLUSTERS'),
};

export const loadJobs = (requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS.START, payload: { meta: {requestId} }
});

export const loadJobsForClusters = (clusterIds: string[], requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS_FOR_CLUSTERS, payload: {clusterIds, meta: {requestId}}
});

export const loadJobsSuccess = (jobs, meta): ActionSuccess => {
  jobs.jobs = jobs.jobs.map(job => prepareJob(job));
  return {type: ActionTypes.LOAD_JOBS.SUCCESS, payload: {response: jobs, meta}};
};

export const loadJobsFail = (error, meta): ActionFailure => ({type: ActionTypes.LOAD_JOBS.FAILURE, payload: {error, meta}});

function prepareJob(job) {
  job.startTime = new Date(job.startTime).getTime();
  job.endTime = new Date(job.end).getTime();
  job.duration = job.endTime > 0 ? job.endTime - job.startTime : -1;
  job.isCompleted = job.status !== JOB_STATUS.IN_PROGRESS;
  return job;
}
