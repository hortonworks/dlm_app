/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CloudAccount } from 'models/cloud-account.model';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { loadAccounts } from 'actions/cloud-account.action';
import { getAllAccounts } from 'selectors/cloud-account.selector';
import { getContainersGroupedByAccounts } from 'selectors/cloud-container.selector';
import { loadContainers } from 'actions/cloud-container.action';
import { getMergedProgress } from 'selectors/progress.selector';
import { ProgressState } from 'models/progress-state.model';
import { CloudAccountService } from 'services/cloud-account.service';

const ACCOUNTS_REQUEST = '[CLOUD STORES] ACCOUNTS_REQUEST';
const CONTAINERS_REQUEST = '[CLOUD STORES] CONTAINERS_REQUEST';

@Component({
  selector: 'dlm-cloud-stores',
  templateUrl: './cloud-stores.component.html',
  styleUrls: ['./cloud-stores.component.scss']
})
export class CloudStoresComponent implements OnInit, OnDestroy {

  accounts$: Observable<CloudAccount[]>;
  containersGrouped$: Observable<any>;
  overallProgress$: Observable<ProgressState>;
  loadAccountsSubscription$;

  tableData$: Observable<CloudAccount[]>;

  constructor(private store: Store<State>, private cloudAccountService: CloudAccountService) {}

  ngOnInit() {
    this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
    const mergedProgress = [ACCOUNTS_REQUEST];
    this.accounts$ = this.store.select(getAllAccounts);
    this.containersGrouped$ = this.store.select(getContainersGroupedByAccounts);
    this.loadAccountsSubscription$ =
      this.accounts$.subscribe(accounts => {
        if (accounts.length) {
          mergedProgress.push(CONTAINERS_REQUEST);
          return this.store.dispatch(loadContainers(accounts, CONTAINERS_REQUEST));
        }
        return null;
      });
    this.overallProgress$ = this.store.select(getMergedProgress(...mergedProgress));
    const allResources$ = Observable.combineLatest(this.accounts$, this.containersGrouped$);
    this.tableData$ = allResources$.map(([accounts, containersGrouped]) => {
      return accounts.map(a => {
        return {
          ...a,
          containers: containersGrouped[a.id]
        };
      });
    });
  }

  ngOnDestroy() {
    this.loadAccountsSubscription$.unsubscribe();
  }

  addAccount() {
    this.cloudAccountService.showAddAccountModal();
  }

}
