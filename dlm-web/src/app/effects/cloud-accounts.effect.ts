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


import {of as observableOf,  Observable } from 'rxjs';

import {catchError, switchMap, map,  mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { CloudAccountService } from 'services/cloud-account.service';
import {
  loadAccountsSuccess,
  loadAccountsFail,
  addCloudStoreSuccess,
  addCloudStoreFailure,
  validateCredentialsSuccess,
  validateCredentialsFailure,
  ActionTypes as accountActions,
  loadAccountsStatusSuccess,
  loadAccountsStatusFail,
  updateCloudStoreSuccess,
  updateCloudStoreFailure,
  deleteCloudStoreFailure,
  deleteCloudStoreSuccess,
  syncCloudStoreFailure,
  syncCloudStoreSuccess,
  deleteUnregisteredStoreSuccess,
  deleteUnregisteredStoreFailure
} from 'actions/cloud-account.action';
import { toPayload } from 'models/to-pay-load.model';

@Injectable()
export class CloudAccountsEffects {

  @Effect()
  loadAccounts$: Observable<any> = this.actions$
    .ofType(accountActions.LOAD_ACCOUNTS.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.accountService.fetchAccounts().pipe(
        map(accounts => loadAccountsSuccess(accounts, payload.meta)),
        catchError(err => observableOf(loadAccountsFail(err, payload.meta))), );
    }), );

  @Effect()
  addCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.ADD_CLOUD_STORE.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.accountService.addCloudStore(payload.cloud_store).pipe(
        map(response => {
          return addCloudStoreSuccess({...response, payload: payload.cloud_store}, payload.meta);
        }),
        catchError(err => observableOf(addCloudStoreFailure(err, payload.meta))), );
    }), );

  @Effect()
  validateCredentials$: Observable<any> = this.actions$
    .ofType(accountActions.VALIDATE_CREDENTIALS.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.accountService.validateCredentials(payload.credentials).pipe(
        map(response => {
          return validateCredentialsSuccess({...response, payload: payload.credentials}, payload.meta);
        }),
        catchError(err => observableOf(validateCredentialsFailure(err, payload.meta))), );
    }), );

  @Effect()
  loadAccountsStatus$: Observable<any> = this.actions$
    .ofType(accountActions.LOAD_ACCOUNTS_STATUS.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.accountService.fetchCloudAccountsStatus().pipe(
        map(statuses => loadAccountsStatusSuccess(statuses, payload.meta)),
        catchError(err => observableOf(loadAccountsStatusFail(err, payload.meta))), );
    }), );

  @Effect()
  updateCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.UPDATE_CLOUD_STORE.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => this.accountService
      .updateCloudStore(payload.cloudStore).pipe(
      map(response => {
        if (response.errors.length) {
          return updateCloudStoreFailure(response.errors, payload.meta);
        }
        return updateCloudStoreSuccess(payload.cloudStore, payload.meta);
      }),
      catchError(err => observableOf(updateCloudStoreFailure(err, payload.meta))), )), );

  @Effect()
  deleteCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.DELETE_CLOUD_STORE.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => this.accountService
      .deleteCloudStore(payload.cloudAccount.id).pipe(
        mergeMap(response => {
          const success = deleteCloudStoreSuccess(payload.cloudAccount, payload.meta);
          if (response.errors.length) {
            return [deleteCloudStoreFailure(response.errors, payload.meta), success];
          }
          return [success];
        })).pipe(
      catchError(err => observableOf(deleteCloudStoreFailure(err, payload.meta))))), );

  @Effect()
  syncCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.SYNC_CLOUD_STORE.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => this.accountService
      .syncCloudStore(payload.cloudAccountId).pipe(
      map(response => {
        if (response.errors.length) {
          return syncCloudStoreFailure(response.errors, payload.meta);
        }
        return syncCloudStoreSuccess(response, payload.meta);
      }),
      catchError(err => observableOf(syncCloudStoreFailure(err, payload.meta))), )), );

  @Effect()
  deleteUnregisteredCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.DELETE_UNREGISTERED_STORE.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.accountService.deleteUnregisteredStore(payload.cloudAccount).pipe(
        map(response => deleteUnregisteredStoreSuccess(response, payload.meta)),
        catchError(err => observableOf(deleteUnregisteredStoreFailure(err, payload.meta))), );
    }), );

  constructor(private actions$: Actions, private accountService: CloudAccountService) {}
}
