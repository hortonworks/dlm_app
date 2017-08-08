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
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { HiveService } from 'services/hive.service';
import {
  loadDatabasesSuccess, loadDatabasesFail,
  loadTablesSuccess, loadTablesFail,
  ActionTypes as hiveListActions
} from 'actions/hivelist.action';

@Injectable()
export class HiveListEffects {

  @Effect()
  loadDatabases$: Observable<any> = this.actions$
    .ofType(hiveListActions.LOAD_DATABASES.START)
    .map(toPayload)
    .switchMap(payload => {
      const { clusterId, meta } = payload;
      return this.hiveService.fetchDatabases(clusterId)
        .map(databases => loadDatabasesSuccess(databases, meta))
        .catch(err => Observable.of(loadDatabasesFail(err, meta)));
    });

  @Effect()
  loadTables$: Observable<any> = this.actions$
    .ofType(hiveListActions.LOAD_TABLES.START)
    .map(toPayload)
    .switchMap(payload => {
      const { clusterId, databaseId, meta } = payload;
      return this.hiveService.fetchTables(clusterId, databaseId)
        .map(tables => loadTablesSuccess(tables, meta))
        .catch(err => Observable.of(loadTablesFail(err, payload.meta)));
    });

  @Effect()
  loadFullDatabases$: Observable<any> = this.actions$
    .ofType(hiveListActions.LOAD_FULL_DATABASES.START)
    .map(toPayload)
    .switchMap(payload => {
      const { clusterId, meta } = payload;
      return this.hiveService.fetchFullDatabases(clusterId)
        .map(databases => loadDatabasesSuccess(databases, meta))
        .catch(err => Observable.of(loadDatabasesFail(err, meta)));
    });

  constructor(private actions$: Actions, private hiveService: HiveService) {
  }
}
