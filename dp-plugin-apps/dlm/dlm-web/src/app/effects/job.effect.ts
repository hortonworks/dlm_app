import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { JobService } from 'services/job.service';
import { loadJobsSuccess, loadJobsFail, abortJobSuccess, abortJobFailure, ActionTypes as jobActions } from 'actions/job.action';
import { operationComplete, operationFail } from 'actions/operation.action';

@Injectable()
export class JobEffects {

  @Effect()
  loadJobs$: Observable<any> = this.actions$
    .ofType(jobActions.LOAD_JOBS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.getJobs()
        .map(jobs => loadJobsSuccess(jobs, payload.meta))
        .catch(err => Observable.of(loadJobsFail(err, payload.meta)));
    });

  @Effect()
  loadJobsForClusters$: Observable<any> = this.actions$
    .ofType(jobActions.LOAD_JOBS_FOR_CLUSTERS)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.getJobsForClusters(payload.clusterIds)
        .map(jobs => loadJobsSuccess(jobs, payload.meta))
        .catch(err => Observable.of(loadJobsFail(err, payload.meta)));
    });

  @Effect()
  loadJobsForPolicy$: Observable<any> = this.actions$
    .ofType(jobActions.LOAD_JOBS_FOR_POLICY)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.getJobsForPolicy(payload)
        .map(jobs => loadJobsSuccess(jobs, payload.meta))
        .catch(err => Observable.of(loadJobsFail(err, payload.meta)));
    });

  @Effect()
  abortJob$: Observable<any> = this.actions$
    .ofType(jobActions.ABORT_JOB.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.abortJob(payload.policy)
        .mergeMap(result => [
          abortJobSuccess(payload),
          operationComplete(result)
        ])
        .catch(err => Observable.from([operationFail(err.json()), abortJobFailure(err)]));
    });

  constructor(private actions$: Actions, private jobService: JobService) {
  }
}
