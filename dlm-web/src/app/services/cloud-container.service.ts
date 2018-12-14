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


import {forkJoin as observableForkJoin, of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAccount } from 'models/cloud-account.model';
import { flatten } from 'utils/array-util';
import { CloudContainer } from 'models/cloud-container.model';

@Injectable()
export class CloudContainerService {

  constructor(private httpClient: HttpClient) {
  }

  fetchContainersForAccounts(accounts: CloudAccount[]): Observable<any> {
    if (!accounts.length) {
      return observableOf([]);
    }
    const requests = accounts.map(account => this.fetchContainersForAccount(account));
    return observableForkJoin(requests).pipe(map(response => {
      return flatten(response.map((r, index) => {
        const provider = accounts[index].accountDetails.provider;
        return (r.items || r).map(c => ({
          ...c,
          provider,
          id: c.id || `${provider}_${c.name}`,
          accountId: accounts[index].id
        }));
      }));
    }));
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
