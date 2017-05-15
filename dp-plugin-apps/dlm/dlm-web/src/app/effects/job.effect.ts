import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { JobService } from 'services/job.service';
import { loadJobsSuccess, loadJobsFail, ActionTypes as jobActions } from 'actions/job.action';

@Injectable()
export class JobEffects {

  @Effect()
  loadJobs$: Observable<any> = this.actions$
    .ofType(jobActions.LOAD_JOBS)
    .switchMap(() => {
      return this.jobService.getJobs()
        .map(jobs => loadJobsSuccess(jobs))
        .catch(err => Observable.of(loadJobsFail(err)));
    });

  @Effect()
  loadJobsForClusters$: Observable<any> = this.actions$
    .ofType(jobActions.LOAD_JOBS_FOR_CLUSTERS)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.getJobsForClusters(payload)
        .map(jobs => loadJobsSuccess(jobs))
        .catch(err => Observable.of(loadJobsFail(err)));
    });

  constructor(private actions$: Actions, private jobService: JobService) { }
}
