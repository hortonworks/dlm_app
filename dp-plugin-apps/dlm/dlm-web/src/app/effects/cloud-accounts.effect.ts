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
  ActionTypes as accountActions
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
  constructor(private actions$: Actions, private accountService: CloudAccountService) {}
}
