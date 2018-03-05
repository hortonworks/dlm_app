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
import { Subscription } from 'rxjs/Subscription';
import { CloudAccount, CloudAccountActions } from 'models/cloud-account.model';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { loadAccounts, loadAccountsStatus, deleteCloudStore, syncCloudStore } from 'actions/cloud-account.action';
import { getFullAccountsInfo } from 'selectors/cloud-account.selector';
import { getMergedProgress } from 'selectors/progress.selector';
import { ProgressState } from 'models/progress-state.model';
import { CloudAccountService } from 'services/cloud-account.service';
import { TranslateService } from '@ngx-translate/core';
import {loadBeaconCloudCredsWithPolicies} from 'actions/beacon-cloud-cred.action';
import {getAllBeaconCloudCreds} from 'selectors/beacon-cloud-cred.selector';
import {BeaconCloudCred} from 'models/beacon-cloud-cred.model';
import {loadPolicies} from 'actions/policy.action';
import { confirmNextAction } from 'actions/confirmation.action';
import { noop } from 'actions/app.action';
import { AsyncActionsService } from 'services/async-actions.service';
import { CRUD_ACTIONS } from 'constants/api.constant';

const ACCOUNTS_REQUEST = '[CLOUD STORES] ACCOUNTS_REQUEST';
const BEACON_ACCOUNTS_REQUEST = '[CLOUD STORES] BEACON CLOUD CREDS';
const POLICIES_REQUEST = '[CLOUD STORES] POLICIES_REQUEST';
const ACCOUNTS_STATUS_REQUEST = '[CLOUD STORES] ACCOUNTS_STATUS_REQUEST';

@Component({
  selector: 'dlm-cloud-stores',
  templateUrl: './cloud-accounts.component.html',
  styleUrls: ['./cloud-accounts.component.scss']
})
export class CloudAccountsComponent implements OnInit, OnDestroy {

  accounts$: Observable<CloudAccount[]>;
  beaconCloudCreds$: Observable<BeaconCloudCred[]>;
  overallProgress$: Observable<ProgressState>;
  _accounts: CloudAccount[];
  accountsSubscription$: Subscription;
  tableData$: Observable<CloudAccount[]>;

  get pageTitle() {
    let title = this.t.instant('page.cloud_stores.header');
    if (this._accounts && this._accounts.length > 0) {
      title = `${title} [${this._accounts.length}]`;
    }
    return title;
  }

  private refreshAccounts(): void {
    [
      loadAccounts(),
      loadBeaconCloudCredsWithPolicies(),
      loadAccountsStatus()
    ].forEach(action => this.store.dispatch(action));
  }

  constructor(
    private store: Store<State>,
    private cloudAccountService: CloudAccountService,
    private t: TranslateService,
    private asyncActions: AsyncActionsService
  ) {
    this.accounts$ = this.store.select(getFullAccountsInfo);
    this.beaconCloudCreds$ = this.store.select(getAllBeaconCloudCreds);
    this.overallProgress$ = this.store.select(getMergedProgress(ACCOUNTS_REQUEST, BEACON_ACCOUNTS_REQUEST, ACCOUNTS_STATUS_REQUEST));
    this.tableData$ = this.accounts$;
  }

  ngOnInit() {
    this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
    this.store.dispatch(loadBeaconCloudCredsWithPolicies({requestId: BEACON_ACCOUNTS_REQUEST}));
    this.store.dispatch(loadAccountsStatus({requestId: ACCOUNTS_STATUS_REQUEST}));
    this.accountsSubscription$ = this.accounts$.subscribe(accounts => {
      this._accounts = accounts;
    });
  }

  addAccount() {
    this.cloudAccountService.showAddAccountModal();
  }

  handleEditAccount(account: CloudAccount): void {
    this.cloudAccountService.showAddAccountModal(account);
  }

  handleRemoveAccount(account: CloudAccount): void {
    const callback = (acc: CloudAccount) => () => {
      this.asyncActions.dispatch(deleteCloudStore(acc))
        .subscribe(progressState => {
          this.cloudAccountService.notifyOnCRUD(progressState, CRUD_ACTIONS.DELETE);
        });
    };
    this.store.dispatch(confirmNextAction(null, {
      title: this.t.instant('page.cloud_stores.content.accounts.delete.title'),
      body: this.t.instant('page.cloud_stores.content.accounts.delete.body', { accountName: account.id }),
      callback: callback(account)
    }));
  }

  handleSyncAccount(account: CloudAccount): void {
    this.asyncActions.dispatch(syncCloudStore(account))
      .subscribe(progressState => {
        this.cloudAccountService.notifyOnCRUD(progressState, CloudAccountActions.SYNC);
        this.refreshAccounts();
      });
  }

  ngOnDestroy() {
    if (this.accountsSubscription$) {
      this.accountsSubscription$.unsubscribe();
    }
  }
}
