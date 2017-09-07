/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { JobService } from 'services/job.service';
import {
  loadJobsSuccess, loadJobsFail, abortJobSuccess, abortJobFailure, ActionTypes as jobActions,
  loadJobsPageForPolicySuccess
} from 'actions/job.action';
import { rerunJobSuccess, rerunJobFailure } from 'actions/job.action';

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
  loadJobsPageForPolicy$: Observable<any> = this.actions$
    .ofType(jobActions.LOAD_JOBS_PAGE_FOR_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      const {policy, meta} = payload;
      return this.jobService.getJobsForPolicyServerPaginated(policy, meta.offset, meta.sortBy, meta.pageSize)
        .map(jobs => loadJobsPageForPolicySuccess(jobs, meta))
        .catch(err => Observable.of(loadJobsFail(err, payload.meta)));
    });

  @Effect()
  abortJob$: Observable<any> = this.actions$
    .ofType(jobActions.ABORT_JOB.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.abortJob(payload.policy)
        .map(result => abortJobSuccess(payload, payload.meta))
        .catch(err => Observable.of(abortJobFailure(err, payload.meta)));
    });

  @Effect()
  rerunJob$: Observable<any> = this.actions$
    .ofType(jobActions.RERUN_JOB.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.rerunJob(payload.policy)
        .map(result => rerunJobSuccess(payload, payload.meta))
        .catch(err => Observable.of(rerunJobFailure(err, payload.meta)));
    });

  constructor(private actions$: Actions, private jobService: JobService) {
  }
}
