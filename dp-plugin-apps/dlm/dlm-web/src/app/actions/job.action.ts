import { type } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { JOB_STATUS } from 'constants/status.constant';

export const ActionTypes = {
  LOAD_JOBS: type('LOAD_JOBS'),
  LOAD_JOBS_FOR_CLUSTERS: type('LOAD_JOBS_FOR_CLUSTERS'),
  LOAD_JOBS_SUCCESS: type('LOAD_JOBS_SUCCESS'),
  LOAD_JOBS_FAIL: type('LOAD_JOBS_FAIL')
};

export const loadJobs = (): Action => ({type: ActionTypes.LOAD_JOBS});

export const loadJobsForClusters = (clusterIds: string[]): Action => ({type: ActionTypes.LOAD_JOBS_FOR_CLUSTERS, payload: clusterIds});

export const loadJobsSuccess = (jobs): Action => {
  jobs.policies = jobs.policies.map(job => prepareJob(job));
  return {type: ActionTypes.LOAD_JOBS_SUCCESS, payload: jobs};
};

export const loadJobsFail = (error): Action => ({type: ActionTypes.LOAD_JOBS_FAIL, payload: error});

function prepareJob(job) {
  job.startTime = new Date(job.startTime).getTime();
  job.endTime = new Date(job.end).getTime();
  job.duration = job.endTime > 0 ? job.endTime - job.startTime : -1;
  job.isCompleted = job.status !== JOB_STATUS.IN_PROGRESS;
  return job;
}
