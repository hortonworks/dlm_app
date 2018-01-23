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
import { PROVIDERS } from 'constants/cloud.constant';
import { TabItem } from '../../common/tabs/tabs.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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

  tabs: TabItem[] = [];

  tableData$: Observable<CloudAccount[]>;

  activeTabValue$: BehaviorSubject<any> = new BehaviorSubject('');

  PROVIDERS = PROVIDERS;

  constructor(private store: Store<State>, private cloudAccountService: CloudAccountService) {
    this.tabs = this.PROVIDERS.map(p => {
      return {
        value: p,
        title: p
      } as TabItem;
    });
    this.activeTabValue$.next(this.PROVIDERS[0]);
  }

  ngOnInit() {
    this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
    this.accounts$ = this.store.select(getAllAccounts);
    this.containersGrouped$ = this.store.select(getContainersGroupedByAccounts);
    this.loadAccountsSubscription$ =
      this.accounts$.subscribe(accounts => this.store.dispatch(loadContainers(accounts, CONTAINERS_REQUEST)));
    this.overallProgress$ = this.store.select(getMergedProgress(ACCOUNTS_REQUEST, CONTAINERS_REQUEST));
    const allResources$ = Observable.combineLatest(this.accounts$, this.containersGrouped$, this.activeTabValue$);
    this.tableData$ = allResources$.map(([accounts, containersGrouped, activeTabValue]) => {
      return accounts.filter(a => a.accountDetails.provider === activeTabValue).map(a => {
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

  selectTab(val) {
    this.activeTabValue$.next(val);
  }

  addAccount() {
    this.cloudAccountService.showAddAccountModal(this.activeTabValue$.getValue());
  }

}
