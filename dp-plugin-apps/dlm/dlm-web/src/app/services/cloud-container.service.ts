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
import { CloudAccount } from 'models/cloud-account.model';
import { flatten } from 'utils/array-util';
import { CloudContainer } from 'models/cloud-container.model';

@Injectable()
export class CloudContainerService {

  constructor(private httpClient: HttpClient) {
  }

  fetchContainersForAccounts(accounts: CloudAccount[]): Observable<any> {
    const requests = accounts.map(account => this.fetchContainersForAccount(account));
    return Observable.forkJoin(requests).map(response => {
      return flatten(response.map((r, index) => {
        const provider = accounts[index].accountDetails.provider;
        return (r.items || r).map(c => ({
          ...c,
          provider,
          id: c.id || `${provider}_${c.name}`,
          accountId: accounts[index].id
        }));
      }));
    });
  }

  fetchContainersForAccount(account: CloudAccount): Observable<any> {
    return this.httpClient.get<any>(`cloud/account/${account.id}/mountpoints`);
  }

  fetchContainerDir(container: CloudContainer, path = '/'): Observable<any> {
    if (!path.endsWith('/')) {
      path = `${path}/`;
    }
    return this.httpClient.get<any>(`cloud/account/${container.accountId}/mountpoint/${container.name}/files/`, {params: {path}});
  }

}
