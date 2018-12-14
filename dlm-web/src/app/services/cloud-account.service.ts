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

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  AddCloudStoreRequestBodyForS3,
  ValidateCredentialsRequestBodyForS3,
  CloudAccountsStatusResponse,
  CloudAccount,
  CloudAccountActions
} from 'models/cloud-account.model';
import { AddAccountModalState, AddAccountModalActions } from 'pages/cloud-accounts/components/add-account-modal/add-account-modal.type';
import { ProgressState } from 'models/progress-state.model';
import { ToastNotification } from 'models/toast-notification.model';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'services/notification.service';
import { CRUD_ACTIONS } from 'constants/api.constant';

@Injectable()
export class CloudAccountService {

  addAccountModalState$: BehaviorSubject<AddAccountModalState> = new BehaviorSubject({
    action: AddAccountModalActions.HIDE
  });

  constructor(
    private httpClient: HttpClient,
    private t: TranslateService,
    private notificationService: NotificationService
  ) { }

  fetchAccounts(): Observable<any> {
    return this.httpClient.get<any>('store/credentials');
  }

  showAddAccountModal(account: CloudAccount = {} as CloudAccount) {
    this.addAccountModalState$.next({
      action: AddAccountModalActions.SHOW,
      account
    });
  }

  closeAddAccountModal() {
    this.addAccountModalState$.next({
      action: AddAccountModalActions.HIDE
    });
  }

  notifyOnCRUD(progressState: ProgressState, action: CloudAccountActions|CRUD_ACTIONS) {
    const translateKey = action.toLowerCase();
    const translateLevel = progressState.success ? 'success_notification' :
      progressState.status > 200 ? 'error_notification' : 'warn_notification';
    const notificationType = progressState.status > 200 ? NOTIFICATION_TYPES.ERROR : NOTIFICATION_TYPES.WARNING;
    const notification: ToastNotification = {
      type: notificationType,
      title: this.t.instant(`page.cloud_stores.content.accounts.${translateKey}.${translateLevel}.title`),
      body: this.t.instant(`page.cloud_stores.content.accounts.${translateKey}.${translateLevel}.body`)
    };
    if (progressState.success) {
      notification.type = NOTIFICATION_TYPES.SUCCESS;
    }
    this.notificationService.create(notification);
  }

  addCloudStore(cloudStore: AddCloudStoreRequestBodyForS3): Observable<any> {
    return this.httpClient.post('store/credential', cloudStore);
  }

  updateCloudStore(cloudStore: AddCloudStoreRequestBodyForS3): Observable<any> {
    return this.httpClient.put('store/credential', cloudStore);
  }

  validateCredentials(credentials: ValidateCredentialsRequestBodyForS3): Observable<any> {
    return this.httpClient.post('cloud/userIdentity', credentials);
  }

  fetchCloudAccountsStatus() {
    return this.httpClient.get<CloudAccountsStatusResponse>('cloud/accounts/status');
  }

  deleteCloudStore(cloudAccountId): Observable<any> {
    return this.httpClient.delete(`store/credential/${cloudAccountId}`);
  }

  syncCloudStore(cloudAccountId): Observable<any> {
    return this.httpClient.put(`store/credential/sync/${cloudAccountId}`, {});
  }

  deleteUnregisteredStore(cloudAccount): Observable<any> {
    return this.httpClient.delete(`store/beaconCredential/${cloudAccount.id}`);
  }
}
