/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
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
    return this.httpClient.get<any>(`clusters/${clusterId}/hive/databases`)
      .map(response => this.normalizeDatabases(response.dbList, clusterId));
  }

  fetchTables(clusterId: string, databaseId: string) {
    return this.httpClient.get<any>(`clusters/${clusterId}/hive/database/${databaseId}/tables`)
      .map(response => this.normalizeTables(response.dbList[0].table, databaseId, clusterId));
  }

  fetchFullDatabases(clusterId: string) {
    return this.fetchDatabases(clusterId).switchMap(databases => {
      const requests = databases.map(db => this.fetchTables(clusterId, db.name));
      return Observable.forkJoin(requests).map(responses => {
        return databases.map((database, index) => ({
          ...database,
          tables: responses[index]
        }));
      });
    });
  }

  checkDatabaseEncryption(clusterId, databaseName: string): Observable<boolean> {
    return this.store.select(getDatabaseForCluster(clusterId, databaseName))
      .map((entity = {}) => !!entity.isEncrypted);
  }
}
