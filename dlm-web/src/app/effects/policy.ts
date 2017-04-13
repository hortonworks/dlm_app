import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { PolicyService } from '../services/policy.service';

import * as policy from '../actions/policy';


@Injectable()
export class PolicyEffects {

  @Effect()
  loadPolicies$: Observable<any> = this.actions$
    .ofType(policy.ActionTypes.LOAD_POLICIES)
    .switchMap(() => {
      return this.policyService.fetchPolicies()
        .map(policies => new policy.LoadPoliciesSuccess(policies))
        .catch(err => Observable.of(new policy.LoadPoliciesSuccess(err)));
    });

  constructor(private actions$: Actions, private policyService: PolicyService) { }
}
