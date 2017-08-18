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
import { go } from '@ngrx/router-store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { PolicyService } from 'services/policy.service';
import { JobService } from 'services/job.service';
import { NotificationService } from 'services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastNotification } from 'models/toast-notification.model';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';

import {
  loadPoliciesSuccess, loadPoliciesFail, createPolicyFail, createPolicySuccess, ActionTypes as policyActions,
  deletePolicySuccess, deletePolicyFail, suspendPolicyFail, suspendPolicySuccess, resumePolicySuccess, resumePolicyFail,
  loadLastJobsSuccess, loadLastJobsFailure
} from 'actions/policy.action';
import { operationComplete, operationFail } from 'actions/operation.action';
import { POLICY_FORM_ID } from 'pages/policies/components/policy-form/policy-form.component';
import { resetFormValue } from 'actions/form.action';
import { truncate } from 'pipes/truncate.pipe';

@Injectable()
export class PolicyEffects {

  @Effect()
  loadPolicies$: Observable<any> = this.actions$
    .ofType(policyActions.LOAD_POLICIES.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.fetchPolicies()
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
          go(['/policies']),
          resetFormValue(POLICY_FORM_ID),
          Observable.of(this.notificationService.create(<ToastNotification> {
            title: this.t.instant('page.policies.success.title'),
            body: this.t.instant('page.policies.success.body', {policyName: truncate(payload.policy.policyDefinition.name, 25)}),
            type: NOTIFICATION_TYPES.SUCCESS
          }))
        ])
        .catch(err => Observable.of(createPolicyFail(err.json(), payload.meta)));
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

  constructor(private actions$: Actions,
              private policyService: PolicyService,
              private jobService: JobService,
              private t: TranslateService,
              private notificationService: NotificationService) {
  }
}
