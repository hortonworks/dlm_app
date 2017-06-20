import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { JOB_STATUS } from 'constants/status.constant';
import { Policy } from 'models/policy.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import * as moment from 'moment';
import { JobTrackingInfo } from 'models/job-tracking-info.model';

export const ActionTypes = {
  LOAD_JOBS: requestType('LOAD_JOBS'),
  LOAD_JOBS_FOR_CLUSTERS: type('LOAD_JOBS_FOR_CLUSTERS'),
  LOAD_JOBS_FOR_POLICY: type('LOAD_JOBS_FOR_POLICY'),
  LOAD_JOBS_SUCCESS: type('LOAD_JOBS_SUCCESS'),
  LOAD_JOBS_FAIL: type('LOAD_JOBS_FAIL'),
  ABORT_JOB: requestType('ABORT_JOB')
};

export const loadJobs = (requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS.START, payload: { meta: {requestId} }
});

export const loadJobsForClusters = (clusterIds: number[], requestId?): Action => ({
  type: ActionTypes.LOAD_JOBS_FOR_CLUSTERS, payload: {clusterIds, meta: {requestId}}
});

export const loadJobsForPolicy = (policy: Policy): Action => ({type: ActionTypes.LOAD_JOBS_FOR_POLICY, payload: policy});

export const loadJobsSuccess = (jobs, meta = {}): ActionSuccess => {
  jobs.jobs = jobs.jobs.map(job => prepareJob(job));
  return {type: ActionTypes.LOAD_JOBS.SUCCESS, payload: {response: jobs, meta}};
};

export const loadJobsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_JOBS.FAILURE, payload: {error, meta}});
export const abortJob = (policy: Policy): Action => ({type: ActionTypes.ABORT_JOB.START, payload: {policy}});
export const abortJobSuccess = (response): ActionSuccess => ({type: ActionTypes.ABORT_JOB.SUCCESS, payload: {response}});
export const abortJobFailure = (error): ActionFailure => ({type: ActionTypes.ABORT_JOB.FAILURE, payload: {error}});

function prepareJob(job) {
  const duration = moment(job.endTime).diff(moment(job.startTime));
  job.duration = duration > 0 ? duration : -1;
  job.isCompleted = job.status !== JOB_STATUS.RUNNING;
  try {
    job.trackingInfo = <JobTrackingInfo>JSON.parse(job.trackingInfo);
  } catch (e) {
    job.trackingInfo = {};
  }
  return job;
}
