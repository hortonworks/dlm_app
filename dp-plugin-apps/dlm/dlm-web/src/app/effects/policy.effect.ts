import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { go } from '@ngrx/router-store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { PolicyService } from 'services/policy.service';

import {
  loadPoliciesSuccess, loadPoliciesFail, createPolicyFail, createPolicySuccess, ActionTypes as policyActions,
  deletePolicySuccess, deletePolicyFail, suspendPolicyFail, suspendPolicySuccess, resumePolicySuccess, resumePolicyFail
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
          go(['/policies'])
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

  constructor(private actions$: Actions, private policyService: PolicyService) {
  }
}
