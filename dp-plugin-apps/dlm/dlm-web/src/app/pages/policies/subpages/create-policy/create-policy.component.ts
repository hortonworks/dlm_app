/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { State } from 'reducers';
import { Pairing } from 'models/pairing.model';
import { getAllPairings } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { saveFormValue } from 'actions/form.action';

import { POLICY_FORM_ID } from '../../components/policy-form/policy-form.component';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';

const PAIR_REQUEST = '[CREATE POLICY] PAIR_REQUEST';

@Component({
  selector: 'dp-create-policy',
  template: `
    <dlm-page-header [title]="'page.policies.header_create'" [isFlexCenter]="true"></dlm-page-header>
    <dlm-progress-container [progressState]="overallProgress$ | async">
      <div>
        <div *ngIf="(pairings$ | async)?.length > 0; else noPairs">
          <dlm-policy-form
            [pairings]="pairings$ | async"
            [sourceClusterId]="sourceClusterId"
            (formSubmit)="handleFormSubmit($event)"
            >
          </dlm-policy-form>
        </div>
        <ng-template #noPairs>
          <div>
            <div class="alert alert-warning" role="alert">
              {{ "page.pairings.content.no_pairs" | translate}}
              <button type="button" class="btn btn-primary" [routerLink]="'/pairings/create'">
                {{ "page.pairings.create_button_text" | translate }}
              </button>
            </div>
          </div>
        </ng-template>
      </div>
    </dlm-progress-container>
  `,
  styleUrls: ['./create-policy.component.scss']
})
export class CreatePolicyComponent implements OnInit, OnDestroy {
  pairings$: Observable<Pairing[]>;
  overallProgress$: Observable<ProgressState>;
  loadParamsSubscription$;
  sourceClusterId: number;

  constructor(private store: Store<State>, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.store.dispatch(loadPairings(PAIR_REQUEST));
    this.pairings$ = this.store.select(getAllPairings);
    this.overallProgress$ = this.store.select(getMergedProgress(PAIR_REQUEST));
    this.loadParamsSubscription$ = this.route.queryParams
      .subscribe(params => {
        const clusterId = params['sourceClusterId'];
        if (clusterId) {
          this.sourceClusterId = clusterId;
        }
      });
  }

  handleFormSubmit(values) {
    this.store.dispatch(saveFormValue(POLICY_FORM_ID, values));
    this.store.dispatch(go(['policies/review']));
  }

  ngOnDestroy() {
    this.loadParamsSubscription$.unsubscribe();
  }

}
