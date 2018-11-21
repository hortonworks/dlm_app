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


import {of as observableOf,  Observable } from 'rxjs';

import {concatMap, catchError, switchMap, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { PolicyService } from 'services/policy.service';
import { JobService } from 'services/job.service';

import {
  loadPoliciesSuccess, loadPoliciesFail, createPolicyFail, createPolicySuccess, ActionTypes as policyActions,
  deletePolicySuccess, deletePolicyFail, suspendPolicyFail, suspendPolicySuccess, resumePolicySuccess, resumePolicyFail,
  loadLastJobsSuccess, loadLastJobsFailure, validatePolicySuccess, validatePolicyFailure,
  updatePolicySuccess, updatePolicyFailure
} from 'actions/policy.action';
import { toPayload } from 'models/to-pay-load.model';

@Injectable()
export class PolicyEffects {

  @Effect()
  loadPolicies$: Observable<any> = this.actions$
    .ofType(policyActions.LOAD_POLICIES.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.policyService.fetchPolicies(payload.queryParams).pipe(
        map(policies => loadPoliciesSuccess(policies, payload.meta)),
        catchError(err => observableOf(loadPoliciesFail(err, payload.meta))), );
    }), );

  @Effect()
  createPolicy$: Observable<any> = this.actions$
    .ofType(policyActions.CREATE_POLICY.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.policyService.createPolicy(payload).pipe(
        map(response => createPolicySuccess(response, payload.meta)),
        catchError(err => observableOf(createPolicyFail(err, payload.meta))), );
    }), );

  @Effect()
  updatePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.UPDATE_POLICY.START).pipe(
    map<Action, any>(toPayload),
    concatMap(payload => this.policyService.updatePolicy(payload).pipe(
      map(response => {
        const { policy, updatePayload, meta } = payload;
        return updatePolicySuccess({response, updatePayload, policy}, meta);
      }),
      catchError(err => observableOf(updatePolicyFailure(err, payload.meta))), )), );


  @Effect()
  deletePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.DELETE_POLICY.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.policyService.deletePolicy(payload.policy).pipe(
        map(result => deletePolicySuccess(payload.policy.id, payload.meta)),
        catchError(err => observableOf(deletePolicyFail(err, payload.meta))), );
    }), );

  @Effect()
  suspendPolicy$: Observable<any> = this.actions$
    .ofType(policyActions.SUSPEND_POLICY.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.policyService.suspendPolicy(payload.policy).pipe(
        map(result => suspendPolicySuccess(payload.policy.id, payload.meta)),
        catchError(err => observableOf(suspendPolicyFail(err, payload.meta))), );
    }), );

  @Effect()
  resumePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.RESUME_POLICY.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.policyService.resumePolicy(payload.policy).pipe(
        map(result => resumePolicySuccess(payload.policy.id, payload.meta)),
        catchError(err => observableOf(resumePolicyFail(err, payload.meta))), );
    }), );


  @Effect()
  loadLastJobs$: Observable<any> = this.actions$
    .ofType(policyActions.LOAD_LAST_JOBS.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.jobService.getJobsForPolicies(payload.policies, payload.numJobs).pipe(
        map(jobs => loadLastJobsSuccess(jobs, payload.meta)),
        catchError(err => observableOf(loadLastJobsFailure(err, payload.meta))), );
    }), );

  @Effect()
  validatePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.VALIDATE_POLICY.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.policyService.validatePolicy(payload.data).pipe(
        map(result => validatePolicySuccess(result, payload.meta)),
        catchError(err => observableOf(validatePolicyFailure(err, payload.meta))), );
    }), );

  constructor(private actions$: Actions,
              private policyService: PolicyService,
              private jobService: JobService) {
  }
}
