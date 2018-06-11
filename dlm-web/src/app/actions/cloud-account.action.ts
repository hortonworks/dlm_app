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

import { requestType } from 'utils/type-action';
import { ActionWithPayload } from 'actions/actions.type';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import { AddCloudStoreRequestBody, ValidateCredentialsRequestBody } from 'models/cloud-account.model';
import { type, createRequestAction } from 'utils/type-action';

export const ActionTypes = {
  LOAD_ACCOUNTS: requestType('LOAD_ACCOUNTS'),
  ADD_CLOUD_STORE: requestType('ADD_CLOUD_STORE'),
  VALIDATE_CREDENTIALS: requestType('VALIDATE_CREDENTIALS'),
  RESET_ADD_CLOUD_PROGRESS_STATE: type('RESET_ADD_CLOUD_PROGRESS_STATE'),
  LOAD_ACCOUNTS_STATUS: requestType('LOAD_ACCOUNTS_STATUS'),
  UPDATE_CLOUD_STORE: requestType('UPDATE_CLOUD_STORE'),
  DELETE_CLOUD_STORE: requestType('DELETE_CLOUD_STORE'),
  SYNC_CLOUD_STORE: requestType('SYNC_CLOUD_STORE'),
  DELETE_UNREGISTERED_STORE: requestType('DELETE_UNREGISTERED_STORE')
};

export const loadAccounts = (requestId?): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_ACCOUNTS.START, payload: {meta: {requestId}}
});

export const loadAccountsSuccess = (accounts, meta = {}): ActionSuccess => {
  return {type: ActionTypes.LOAD_ACCOUNTS.SUCCESS, payload: {response: accounts, meta}};
};

export const loadAccountsFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_ACCOUNTS.FAILURE,
  payload: {error, meta}
});

export const addCloudStore = (cloud_store: AddCloudStoreRequestBody, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.ADD_CLOUD_STORE.START,
  payload: {cloud_store, meta}
});

export const addCloudStoreSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.ADD_CLOUD_STORE.SUCCESS,
  payload: { response, meta }
});

export const addCloudStoreFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.ADD_CLOUD_STORE.FAILURE,
  payload: { error, meta }
});

export const validateCredentials = (credentials: ValidateCredentialsRequestBody, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.VALIDATE_CREDENTIALS.START,
  payload: {credentials, meta}
});

export const validateCredentialsSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.VALIDATE_CREDENTIALS.SUCCESS,
  payload: { response, meta }
});

export const validateCredentialsFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.VALIDATE_CREDENTIALS.FAILURE,
  payload: { error, meta }
});

export const resetAddCloudProgressState = (requestId): ActionWithPayload<any> => ({
  type: ActionTypes.RESET_ADD_CLOUD_PROGRESS_STATE,
  payload: {requestId}
});

export const updateCloudStore = (cloudStore: AddCloudStoreRequestBody, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.UPDATE_CLOUD_STORE.START,
  payload: {cloudStore, meta}
});

export const updateCloudStoreSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.UPDATE_CLOUD_STORE.SUCCESS,
  payload: { response, meta }
});

export const updateCloudStoreFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.UPDATE_CLOUD_STORE.FAILURE,
  payload: { error, meta }
});

export const loadAccountsStatus = (meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_ACCOUNTS_STATUS.START, payload: {meta}
});

export const loadAccountsStatusSuccess = (statuses, meta = {}): ActionSuccess => {
  return {type: ActionTypes.LOAD_ACCOUNTS_STATUS.SUCCESS, payload: {response: statuses, meta}};
};

export const loadAccountsStatusFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_ACCOUNTS_STATUS.FAILURE,
  payload: {error, meta}
});

export const {
  deleteCloudStore,
  deleteCloudStoreSuccess,
  deleteCloudStoreFailure
} = createRequestAction(ActionTypes.DELETE_CLOUD_STORE, {
  start: (cloudAccount, meta = {}) => ({ meta, cloudAccount })
});

export const {
  syncCloudStore,
  syncCloudStoreSuccess,
  syncCloudStoreFailure
} = createRequestAction(ActionTypes.SYNC_CLOUD_STORE, {
  start: (cloudAccountId, meta = {}) => ({ meta, cloudAccountId })
});

export const {
  deleteUnregisteredStore,
  deleteUnregisteredStoreSuccess,
  deleteUnregisteredStoreFailure,
} = createRequestAction(ActionTypes.DELETE_UNREGISTERED_STORE, {
  start: (cloudAccount, meta = {}) => ({
    cloudAccount,
    meta
  })
});
