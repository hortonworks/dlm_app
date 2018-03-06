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

@Injectable()
export class CloudAccountsEffects {

  @Effect()
  loadAccounts$: Observable<any> = this.actions$
    .ofType(accountActions.LOAD_ACCOUNTS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.accountService.fetchAccounts()
        .map(accounts => loadAccountsSuccess(accounts, payload.meta))
        .catch(err => Observable.of(loadAccountsFail(err, payload.meta)));
    });

  @Effect()
  addCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.ADD_CLOUD_STORE.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.accountService.addCloudStore(payload.cloud_store)
        .map(response => {
          return addCloudStoreSuccess({...response, payload: payload.cloud_store}, payload.meta);
        })
        .catch(err => Observable.of(addCloudStoreFailure(err, payload.meta)));
    });

  @Effect()
  validateCredentials$: Observable<any> = this.actions$
    .ofType(accountActions.VALIDATE_CREDENTIALS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.accountService.validateCredentials(payload.credentials)
        .map(response => {
          return validateCredentialsSuccess({...response, payload: payload.credentials}, payload.meta);
        })
        .catch(err => Observable.of(validateCredentialsFailure(err, payload.meta)));
    });

  @Effect()
  loadAccountsStatus$: Observable<any> = this.actions$
    .ofType(accountActions.LOAD_ACCOUNTS_STATUS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.accountService.fetchCloudAccountsStatus()
        .map(statuses => loadAccountsStatusSuccess(statuses, payload.meta))
        .catch(err => Observable.of(loadAccountsStatusFail(err, payload.meta)));
    });

  @Effect()
  updateCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.UPDATE_CLOUD_STORE.START)
    .map(toPayload)
    .switchMap(payload => this.accountService
      .updateCloudStore(payload.cloudStore)
      .map(response => {
        if (response.errors.length) {
          return updateCloudStoreFailure(response.errors, payload.meta);
        }
        return updateCloudStoreSuccess(payload.cloudStore, payload.meta);
      })
      .catch(err => Observable.of(updateCloudStoreFailure(err, payload.meta))));

  @Effect()
  deleteCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.DELETE_CLOUD_STORE.START)
    .map(toPayload)
    .switchMap(payload => this.accountService
      .deleteCloudStore(payload.cloudAccount.id)
      .mergeMap(response => {
        const success = deleteCloudStoreSuccess(payload.cloudAccount, payload.meta);
        if (response.errors.length) {
          return [deleteCloudStoreFailure(response.errors, payload.meta), success];
        }
        return [success];
      })
      .catch(err => Observable.of(deleteCloudStoreFailure(err, payload.meta))));

  @Effect()
  syncCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.SYNC_CLOUD_STORE.START)
    .map(toPayload)
    .switchMap(payload => this.accountService
      .syncCloudStore(payload.cloudAccount)
      .map(response => {
        if (response.errors.length) {
          return syncCloudStoreFailure(response.errors, payload.meta);
        }
        return syncCloudStoreSuccess(response, payload.meta);
      })
      .catch(err => Observable.of(syncCloudStoreFailure(err, payload.meta))));

  @Effect()
  deleteUnregisteredCloudStore$: Observable<any> = this.actions$
    .ofType(accountActions.DELETE_UNREGISTERED_STORE.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.accountService.deleteUnregisteredStore(payload.cloudAccount)
        .map(response => deleteUnregisteredStoreSuccess(response, payload.meta))
        .catch(err => Observable.of(deleteUnregisteredStoreFailure(err, payload.meta)));
    });

  constructor(private actions$: Actions, private accountService: CloudAccountService) {}
}
