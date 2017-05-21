import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { JobService } from 'services/job.service';
import { loadJobsSuccess, loadJobsFail, ActionTypes as jobActions } from 'actions/job.action';

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

  constructor(private actions$: Actions, private jobService: JobService) {
  }
}
