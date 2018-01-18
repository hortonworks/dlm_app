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
import { CloudAccount } from 'models/cloud-account.model';
import { CloudContainer } from 'models/cloud-container.model';

export const ActionTypes = {
  LOAD_CONTAINERS: requestType('LOAD_CONTAINERS'),
  LOAD_DIR: requestType('LOAD_DIR')
};

export const loadContainers = (accounts: CloudAccount[], requestId?): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_CONTAINERS.START, payload: {accounts, meta: {requestId}}
});

export const loadContainersSuccess = (containers, meta = {}): ActionSuccess => {
  return {type: ActionTypes.LOAD_CONTAINERS.SUCCESS, payload: {response: containers, meta}};
};

export const loadContainersFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_CONTAINERS.FAILURE,
  payload: {error, meta}
});

export const loadContainerDir = (container: CloudContainer, path: string, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_DIR.START, payload: {container, path, meta}
});

export const loadContainerDirSuccess = (dirContent, meta = {}): ActionSuccess => {
  return {type: ActionTypes.LOAD_DIR.SUCCESS, payload: {response: dirContent, meta}};
};

export const loadContainerDirFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_DIR.FAILURE,
  payload: {error, meta}
});