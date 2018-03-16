/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionWithPayload } from 'actions/actions.type';

import { requestType, createRequestAction } from 'utils/type-action';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_BEACON_ADMIN_STATUS: requestType('LOAD_BEACON_ADMIN_STATUS'),
  LOAD_BEACON_CONFIG_STATUS: requestType('LOAD_BEACON_CONFIG_STATUS')
};

export const loadBeaconAdminStatus = (meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_BEACON_ADMIN_STATUS.START,
  payload: {meta}
});

export const loadBeaconAdminStatusSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.LOAD_BEACON_ADMIN_STATUS.SUCCESS,
  payload: {response, meta}
});

export const loadBeaconAdminStatusFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.LOAD_BEACON_ADMIN_STATUS.FAILURE,
  payload: {error, meta}
});

export const {
  loadBeaconConfigStatus,
  loadBeaconConfigStatusSuccess,
  loadBeaconConfigStatusFailure
} = createRequestAction(ActionTypes.LOAD_BEACON_CONFIG_STATUS, {
  start: (meta) => ({ meta })
});
