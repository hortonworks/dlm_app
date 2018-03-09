/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  AddCloudStoreRequestBody,
  ValidateCredentialsRequestBody,
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

  addCloudStore(cloudStore: AddCloudStoreRequestBody): Observable<any> {
    return this.httpClient.post('store/credential', cloudStore);
  }

  updateCloudStore(cloudStore: AddCloudStoreRequestBody): Observable<any> {
    return this.httpClient.put('store/credential', cloudStore);
  }

  validateCredentials(credentials: ValidateCredentialsRequestBody): Observable<any> {
    return this.httpClient.post('cloud/userIdentity', credentials);
  }

  fetchCloudAccountsStatus() {
    return this.httpClient.get<CloudAccountsStatusResponse>('cloud/accounts/status');
  }

  deleteCloudStore(cloudAccountId): Observable<any> {
    return this.httpClient.delete(`store/credential/${cloudAccountId}`);
  }

  syncCloudStore(cloudAccount): Observable<any> {
    return this.httpClient.put(`store/credential/sync`, cloudAccount);
  }

  deleteUnregisteredStore(cloudAccount): Observable<any> {
    return this.httpClient.delete(`store/beaconCredential/${cloudAccount.id}`);
  }
}
