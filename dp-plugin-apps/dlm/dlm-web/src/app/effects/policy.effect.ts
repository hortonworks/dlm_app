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
import * as RouterActions from 'actions/router.action';
import { PolicyService } from 'services/policy.service';
import { JobService } from 'services/job.service';

import {
  loadPoliciesSuccess, loadPoliciesFail, createPolicyFail, createPolicySuccess, ActionTypes as policyActions,
  deletePolicySuccess, deletePolicyFail, suspendPolicyFail, suspendPolicySuccess, resumePolicySuccess, resumePolicyFail,
  loadLastJobsSuccess, loadLastJobsFailure, wizardResetAllSteps, validatePolicySuccess, validatePolicyFailure
} from 'actions/policy.action';

@Injectable()
export class PolicyEffects {

  @Effect()
  loadPolicies$: Observable<any> = this.actions$
    .ofType(policyActions.LOAD_POLICIES.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.fetchPolicies(payload.queryParams)
        .map(policies => loadPoliciesSuccess(policies, payload.meta))
        .catch(err => Observable.of(loadPoliciesFail(err, payload.meta)));
    });

  @Effect()
  createPolicy$: Observable<any> = this.actions$
    .ofType(policyActions.CREATE_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.createPolicy(payload)
        .mergeMap(response => [
          createPolicySuccess(response, payload.meta),
          new RouterActions.Go({path: ['/policies']}),
          wizardResetAllSteps()
        ])
        .catch(err => Observable.of(createPolicyFail(err, payload.meta)));
    });

  @Effect()
  deletePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.DELETE_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.deletePolicy(payload.policy)
        .map(result => deletePolicySuccess(payload.policy.id, payload.meta))
        .catch(err => Observable.of(deletePolicyFail(err, payload.meta)));
    });

  @Effect()
  suspendPolicy$: Observable<any> = this.actions$
    .ofType(policyActions.SUSPEND_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.suspendPolicy(payload.policy)
        .map(result => suspendPolicySuccess(payload.policy.id, payload.meta))
        .catch(err => Observable.of(suspendPolicyFail(err, payload.meta)));
    });

  @Effect()
  resumePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.RESUME_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.resumePolicy(payload.policy)
        .map(result => resumePolicySuccess(payload.policy.id, payload.meta))
        .catch(err => Observable.of(resumePolicyFail(err, payload.meta)));
    });


  @Effect()
  loadLastJobs$: Observable<any> = this.actions$
    .ofType(policyActions.LOAD_LAST_JOBS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.getJobsForPolicies(payload.policies, payload.numJobs)
        .map(jobs => loadLastJobsSuccess(jobs, payload.meta))
        .catch(err => Observable.of(loadLastJobsFailure(err, payload.meta)));
    });

  @Effect()
  validatePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.VALIDATE_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.validatePolicy(payload.data)
        .map(result => validatePolicySuccess(result, payload.meta))
        .catch(err => Observable.of(validatePolicyFailure(err, payload.meta)));
    });

  constructor(private actions$: Actions,
              private policyService: PolicyService,
              private jobService: JobService) {
  }
}
