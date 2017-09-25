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
import { Http } from '@angular/http';
import { mapResponse } from 'utils/http-util';
import { HiveDatabase } from 'models/hive-database.model';

@Injectable()
export class HiveService {

  makeDatabaseId(databaseId, clusterId) {
    return `${databaseId}@${clusterId}`;
  }

  makeDatabaseTableId(databaseId, clusterId) {
    return `${databaseId}/${clusterId}`;
  }

  normalizeDatabases(databases, clusterId) {
    return databases.map(db => ({name: db.database, clusterId, entityId: this.makeDatabaseId(db.database, clusterId)}));
  }

  normalizeTables(tables, databaseId, clusterId) {
    return tables.map(tableName => ({id: this.makeDatabaseTableId(databaseId, tableName), name: tableName,
      databaseEntitityId: this.makeDatabaseId(databaseId, clusterId)}));
  }

  constructor(private http: Http) {}

  fetchDatabases(clusterId): Observable<any> {
    return mapResponse(this.http.get(`clusters/${clusterId}/hive/databases`))
      .map(response => this.normalizeDatabases(response.dbList, clusterId));
  }

  fetchTables(clusterId: string, databaseId: string) {
    return mapResponse(this.http.get(`clusters/${clusterId}/hive/database/${databaseId}/tables`))
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
}
