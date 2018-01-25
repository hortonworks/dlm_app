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
import { AddCloudStoreRequestBody, ValidateCredentialsRequestBody } from 'models/cloud-account.model';

@Injectable()
export class CloudAccountService {

  showAddAccountModal$: BehaviorSubject<any> = new BehaviorSubject('');

  constructor(private httpClient: HttpClient) { }

  fetchAccounts(): Observable<any> {
    return this.httpClient.get<any>('store/credentials');
  }

  showAddAccountModal() {
    this.showAddAccountModal$.next('show');
  }

  closeAddAccountModal() {
    this.showAddAccountModal$.next('close');
  }

  addCloudStore(cloudStore: AddCloudStoreRequestBody): Observable<any> {
    return this.httpClient.post('store/credential', cloudStore);
  }

  validateCredentials(credentials: ValidateCredentialsRequestBody): Observable<any> {
    return this.httpClient.post('cloud/userIdentity', credentials);
  }
}
