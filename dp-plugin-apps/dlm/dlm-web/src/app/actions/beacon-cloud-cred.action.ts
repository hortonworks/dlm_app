/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionWithPayload } from 'actions/actions.type';

import { requestType } from 'utils/type-action';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_BEACON_CLOUD_CREDS: requestType('LOAD_BEACON_CLOUD_CREDS')
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
