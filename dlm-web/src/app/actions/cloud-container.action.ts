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
