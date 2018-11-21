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

import { ActionWithPayload } from 'actions/actions.type';

import { requestType } from 'utils/type-action';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_BEACON_CLOUD_CREDS: requestType('LOAD_BEACON_CLOUD_CREDS'),
  LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES: requestType('LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES')
};

export const loadBeaconCloudCreds = (meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_BEACON_CLOUD_CREDS.START,
  payload: {meta}
});

export const loadBeaconCloudCredsSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.LOAD_BEACON_CLOUD_CREDS.SUCCESS,
  payload: {response, meta}
});

export const loadBeaconCloudCredsFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.LOAD_BEACON_CLOUD_CREDS.FAILURE,
  payload: {error, meta}
});

export const loadBeaconCloudCredsWithPolicies = (meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.START,
  payload: {meta}
});

export const loadBeaconCloudCredsWithPoliciesSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.SUCCESS,
  payload: {response, meta}
});

export const loadBeaconCloudCredsWithPoliciesFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.FAILURE,
  payload: {error, meta}
});
