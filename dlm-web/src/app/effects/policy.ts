import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { PolicyService } from '../services/policy.service';

import {
  loadPoliciesSuccess, loadPoliciesFail, createPolicyFail, createPolicySuccess, ActionTypes as policyActions
} from '../actions/policy';

@Injectable()
export class PolicyEffects {

  @Effect()
  loadPolicies$: Observable<any> = this.actions$
    .ofType(policyActions.LOAD_POLICIES)
    .switchMap(() => {
      return this.policyService.fetchPolicies()
        .map(policies => loadPoliciesSuccess(policies))
        .catch(err => Observable.of(loadPoliciesFail(err)));
    });

  @Effect()
  createPolicy$: Observable<any> = this.actions$
    .ofType(policyActions.CREATE_POLICY)
    .map(toPayload)
    .switchMap((payload) => {
      return this.policyService.createPolicy(payload)
        .mergeMap(response => [
          createPolicySuccess(response),
          go(['/policies'])
        ])
        .catch(err => Observable.of(createPolicyFail(err)));
    });

  constructor(private actions$: Actions, private policyService: PolicyService) { }
}
