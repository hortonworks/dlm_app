/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */


import {of as observableOf,  Observable, Subscription, forkJoin } from 'rxjs';

import {map, tap,  merge } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAccount, CloudAccountActions } from 'models/cloud-account.model';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { loadAccounts, loadAccountsStatus, deleteCloudStore, syncCloudStore, deleteUnregisteredStore } from 'actions/cloud-account.action';
import { getFullAccountsInfo, getUnregisteredDLMCreds } from 'selectors/cloud-account.selector';
import { ProgressState } from 'models/progress-state.model';
import { CloudAccountService } from 'services/cloud-account.service';
import { TranslateService } from '@ngx-translate/core';
import { loadBeaconCloudCredsWithPolicies } from 'actions/beacon-cloud-cred.action';
import { getAllBeaconCloudCreds } from 'selectors/beacon-cloud-cred.selector';
import { BeaconCloudCred } from 'models/beacon-cloud-cred.model';
import { confirmNextAction } from 'actions/confirmation.action';
import { AsyncActionsService } from 'services/async-actions.service';
import { CRUD_ACTIONS } from 'constants/api.constant';
import { NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE } from 'constants/notification.constant';
import { PageComponent } from 'pages/page.component';

@Component({
  selector: 'dlm-cloud-stores',
  templateUrl: './cloud-accounts.component.html',
  styleUrls: ['./cloud-accounts.component.scss']
})
export class CloudAccountsComponent extends PageComponent implements OnInit, OnDestroy {

  accounts$: Observable<CloudAccount[]>;
  beaconCloudCreds$: Observable<BeaconCloudCred[]>;
  unregisteredAccounts$: Observable<BeaconCloudCred[]>;
  overallProgress$: Observable<ProgressState>;
  _accounts: CloudAccount[];
  accountsSubscription$: Subscription;
  tableData$: Observable<CloudAccount[]>;
  isSyncInProgress = false;

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
    super();
    this.accounts$ = this.store.select(getFullAccountsInfo);
    this.beaconCloudCreds$ = this.store.select(getAllBeaconCloudCreds);
    this.tableData$ = this.accounts$;
    this.unregisteredAccounts$ = this.store.select(getUnregisteredDLMCreds);
  }

  ngOnInit() {
    this.overallProgress$ = observableOf({ isInProgress: true } as ProgressState)
      .pipe<ProgressState>(merge(forkJoin([
          loadAccounts(),
          loadBeaconCloudCredsWithPolicies()
        ].map(action => this.asyncActions.dispatch(action))).pipe(
        map(results => results[0]))
      )).pipe(
      tap(_ => this.store.dispatch(loadAccountsStatus())));
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

  handleSyncAccount(accountId: String): void {
    this.isSyncInProgress = true;
    this.asyncActions.dispatch(syncCloudStore(accountId))
      .subscribe(progressState => {
        this.isSyncInProgress = false;
        this.cloudAccountService.notifyOnCRUD(progressState, CloudAccountActions.SYNC);
        this.refreshAccounts();
      });
  }

  handleDeleteUnregisteredAccount(account: CloudAccount): void {
    const notification = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: 'page.cloud_stores.content.accounts.delete.success_notification.title',
        body: 'page.cloud_stores.content.accounts.delete.success_notification.body'
      },
      [NOTIFICATION_TYPES.ERROR]: {
        title: 'page.cloud_stores.content.accounts.delete.error_notification.title',
        body: 'page.cloud_stores.content.accounts.delete.error_notification.body',
        contentType: NOTIFICATION_CONTENT_TYPE.INLINE
      },
      levels: [NOTIFICATION_TYPES.SUCCESS, NOTIFICATION_TYPES.ERROR]
    };

    const callback = (acc: CloudAccount) => () => {
      this.asyncActions.dispatch(deleteUnregisteredStore(acc, {notification}))
        .subscribe(_ => {
          this.refreshAccounts();
        });
    };

    this.store.dispatch(confirmNextAction(null, {
      title: this.t.instant('page.cloud_stores.content.accounts.delete.title'),
      body: this.t.instant('page.cloud_stores.content.accounts.delete.body', { accountName: account.id }),
      callback: callback(account)
    }));
  }

  ngOnDestroy() {
    if (this.accountsSubscription$) {
      this.accountsSubscription$.unsubscribe();
    }
  }
}
