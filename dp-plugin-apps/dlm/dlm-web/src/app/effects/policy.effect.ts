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
          this.notificationService.create(<ToastNotification>{
            title: this.t.instant('page.policies.success.title'),
            body: this.t.instant('page.policies.success.body', {policyName: payload.policy.policyDefinition.name}),
            type: NOTIFICATION_TYPES.SUCCESS
          })
        ])
        .catch(err => Observable.of(createPolicyFail(err.json(), payload.meta)));
    });

  @Effect()
  deletePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.DELETE_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.deletePolicy(payload)
        .mergeMap(result => [
          deletePolicySuccess(payload.id),
          operationComplete(result)
        ])
        .catch(err => Observable.from([operationFail(err.json()), deletePolicyFail(err)]));
    });

  @Effect()
  suspendPolicy$: Observable<any> = this.actions$
    .ofType(policyActions.SUSPEND_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.suspendPolicy(payload)
        .mergeMap(result => [
          suspendPolicySuccess(payload.id),
          operationComplete(result)
        ])
        .catch(err => Observable.from([operationFail(err.json()), suspendPolicyFail(err)]));
    });

  @Effect()
  resumePolicy$: Observable<any> = this.actions$
    .ofType(policyActions.RESUME_POLICY.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.policyService.resumePolicy(payload)
        .mergeMap(result => [
          resumePolicySuccess(payload.id),
          operationComplete(result)
        ])
        .catch(err => Observable.from([operationFail(err.json()), resumePolicyFail(err)]));
    });


  @Effect()
  loadLastJobs$: Observable<any> = this.actions$
    .ofType(policyActions.LOAD_LAST_JOBS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.jobService.getJobsForPolicies(payload.policies, 3)
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
