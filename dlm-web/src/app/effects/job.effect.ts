/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
      return this.jobService.getJobsForPolicyServerPaginated(policy, meta.offset, meta.sortBy, meta.pageSize, meta.filters)
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
