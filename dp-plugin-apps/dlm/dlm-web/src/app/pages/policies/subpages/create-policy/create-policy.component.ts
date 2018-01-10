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
import { State } from 'reducers';
import { Pairing } from 'models/pairing.model';
import { getAllPairings } from 'selectors/pairing.selector';
import * as RouterActions from 'actions/router.action';
import { loadPairings } from 'actions/pairing.action';
import { saveFormValue } from 'actions/form.action';

import { POLICY_FORM_ID } from '../../components/policy-form/policy-form.component';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { loadAccounts } from 'actions/cloud-account.action';
import { getAllAccounts } from 'selectors/cloud-account.selector';
import { CloudAccount } from 'models/cloud-account.model';
import { loadContainers } from 'actions/cloud-container.action';
import { getAllContainers, getAllContainersGrouped } from 'selectors/cloud-container.selector';
import { CloudContainer } from 'models/cloud-container.model';

const PAIR_REQUEST = '[CREATE POLICY] PAIR_REQUEST';
const ACCOUNTS_REQUEST = '[CREATE POLICY] ACCOUNTS_REQUEST';
const CONTAINERS_REQUEST = '[CREATE POLICY] CONTAINERS_REQUEST';

@Component({
  selector: 'dp-create-policy',
  template: `
    <dlm-page-header [title]="'page.policies.header_create'"
                     [isFlexCenter]="true"
                     [linkText]="'page.policies.subpage.create_policy.help_text'"
                     [linkTo]="'page.policies.subpage.create_policy.help_url'">
    </dlm-page-header>
    <dlm-progress-container [progressState]="overallProgress$ | async">
      <div>
        <div *ngIf="(pairings$ | async)?.length > 0; else noPairs">
          <dlm-policy-form
            [containers]="containersGrouped$ | async"
            [containersList]="containers$ | async"
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
  accounts$: Observable<CloudAccount[]>;
  containers$: Observable<CloudContainer[]>;
  containersGrouped$: Observable<any>;
  overallProgress$: Observable<ProgressState>;
  loadParamsSubscription$;
  loadAccountsSubscription$;
  sourceClusterId: number;

  constructor(private store: Store<State>, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.store.dispatch(loadPairings(PAIR_REQUEST));
    this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
    this.pairings$ = this.store.select(getAllPairings);
    this.accounts$ = this.store.select(getAllAccounts);
    this.containersGrouped$ = this.store.select(getAllContainersGrouped);
    this.containers$ = this.store.select(getAllContainers);
    this.loadAccountsSubscription$ = this.accounts$.subscribe(accounts => {
      this.store.dispatch(loadContainers(accounts, CONTAINERS_REQUEST));
    });
    this.overallProgress$ = this.store.select(getMergedProgress(ACCOUNTS_REQUEST, CONTAINERS_REQUEST, PAIR_REQUEST));
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
    this.store.dispatch(new RouterActions.Go({path: ['policies/review']}));
  }

  ngOnDestroy() {
    this.loadParamsSubscription$.unsubscribe();
    this.loadAccountsSubscription$.unsubscribe();
  }

}
