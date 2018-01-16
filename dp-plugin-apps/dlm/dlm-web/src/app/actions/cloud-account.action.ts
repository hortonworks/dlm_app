/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { requestType } from 'utils/type-action';
import { ActionWithPayload } from 'actions/actions.type';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_ACCOUNTS: requestType('LOAD_ACCOUNTS')
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
