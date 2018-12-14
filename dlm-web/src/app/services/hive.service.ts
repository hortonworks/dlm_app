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


import {forkJoin as observableForkJoin,  Observable } from 'rxjs';

import {map, switchMap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HiveDatabase, HiveTable } from 'models/hive-database.model';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { getDatabaseForCluster } from 'selectors/hive.selector';

@Injectable()
export class HiveService {

  makeDatabaseId(databaseId, clusterId) {
    return `${databaseId}@${clusterId}`;
  }

  makeDatabaseTableId(databaseId, clusterId) {
    return `${databaseId}/${clusterId}`;
  }

  private normalizeDatabases(databases, clusterId): HiveDatabase[] {
    return databases.map(db => ({
      ...db,
      name: db.database,
      entityId: this.makeDatabaseId(db.database, clusterId),
      clusterId
    }) as HiveDatabase);
  }

  private normalizeTables(tables, databaseId, clusterId): HiveTable[] {
    return tables.map(tableName => ({
      id: this.makeDatabaseTableId(databaseId, tableName),
      name: tableName,
      databaseEntityId: this.makeDatabaseId(databaseId, clusterId)
    }) as HiveTable);
  }

  constructor(private httpClient: HttpClient, private store: Store<State>) {}

  fetchDatabases(clusterId): Observable<any> {
    return this.httpClient.get<any>(`clusters/${clusterId}/hive/databases`).pipe(
      map(response => this.normalizeDatabases(response.dbList, clusterId)));
  }

  fetchTables(clusterId: string, databaseId: string) {
    return this.httpClient.get<any>(`clusters/${clusterId}/hive/database/${databaseId}/tables`).pipe(
      map(response => ({
        tables: this.normalizeTables(response.dbList[0].table, databaseId, clusterId),
        isEncrypted: response.dbList[0].isEncrypted
      })));
  }

  fetchFullDatabases(clusterId: string) {
    return this.fetchDatabases(clusterId).pipe(switchMap(databases => {
      const requests = databases.map(db => this.fetchTables(clusterId, db.name));
      return observableForkJoin(requests).pipe(map(responses => {
        return databases.map((database, index) => ({
          ...database,
          tables: responses[index]
        }));
      }));
    }));
  }

  checkDatabaseEncryption(clusterId, databaseName: string): Observable<HiveDatabase> {
    return this.store.select(getDatabaseForCluster(clusterId, databaseName)).pipe(
      map((entity = {} as HiveDatabase) => entity));
  }
}
