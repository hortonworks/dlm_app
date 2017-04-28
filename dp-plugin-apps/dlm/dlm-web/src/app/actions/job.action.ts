import { type } from '../utils/type-action';
import { Action } from '@ngrx/store';

export const ActionTypes = {
  LOAD_JOBS: type('LOAD_JOBS'),
  LOAD_JOBS_SUCCESS: type('LOAD_JOBS_SUCCESS'),
  LOAD_JOBS_FAIL: type('LOAD_JOBS_FAIL')
};

export const loadJobs = (): Action => ({type: ActionTypes.LOAD_JOBS});

export const loadJobsSuccess = (jobs): Action => {
  jobs.job = jobs.job.map(job => prepareJob(job));
  return {type: ActionTypes.LOAD_JOBS_SUCCESS, payload: jobs};
};

export const loadJobsFail = (error): Action => ({type: ActionTypes.LOAD_JOBS_FAIL});

function prepareJob(job) {
  job.runTime = job.endTime > 0 ? job.endTime - job.startTime : -1;
  job.isCompleted = job.status !== 'In Progress';
  return job;
}
