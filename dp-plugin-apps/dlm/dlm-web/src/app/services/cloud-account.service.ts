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

@Injectable()
export class CloudAccountService {

  showAddAccountModal$: BehaviorSubject<any> = new BehaviorSubject('');

  constructor(private httpClient: HttpClient) { }

  fetchAccounts(): Observable<any> {
    return this.httpClient.get<any>('store/credentials');
  }

  showAddAccountModal(provider) {
    this.showAddAccountModal$.next(provider);
  }

}
