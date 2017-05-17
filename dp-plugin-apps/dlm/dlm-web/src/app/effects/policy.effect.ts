import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { PolicyService } from '../services/policy.service';

import {
  loadPoliciesSuccess, loadPoliciesFail, createPolicyFail, createPolicySuccess, ActionTypes as policyActions
} from '../actions/policy.action';

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

  constructor(private actions$: Actions, private policyService: PolicyService) { }
}
