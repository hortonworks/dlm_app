/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import { PairingRequestBody } from 'models/pairing.model';

export const ActionTypes = {
  LOAD_PAIRINGS: requestType('LOAD_PAIRINGS'),
  CREATE_PAIRING: requestType('CREATE_PAIRING'),
  DELETE_PAIRING: requestType('DELETE_PAIRING'),
};

export const loadPairings = (requestId?): Action => ({type: ActionTypes.LOAD_PAIRINGS.START, payload: {meta: {requestId}}});
export const loadPairingsSuccess = (pairings, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_PAIRINGS.SUCCESS,
  payload: {response: pairings, meta}
});
export const loadPairingsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_PAIRINGS.FAILURE, payload: {error, meta}});

export const createPairing = (pairing, meta = {}): Action => ({
  type: ActionTypes.CREATE_PAIRING.START,
  payload: { pairing, meta }
});
export const createPairingSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.CREATE_PAIRING.SUCCESS,
  payload: { response, meta }
});
export const createPairingFail = (error, meta): ActionFailure => ({
  type: ActionTypes.CREATE_PAIRING.FAILURE,
  payload: { error, meta }
});

export const deletePairing = (pairing: PairingRequestBody, meta = {}): Action => ({
  type: ActionTypes.DELETE_PAIRING.START,
  payload: { pairing, meta }
});
export const deletePairingSuccess = (response, meta): ActionSuccess => ({
  type: ActionTypes.DELETE_PAIRING.SUCCESS,
  payload: { response, meta }
});
export const deletePairingFail = (error, meta): ActionFailure => ({
  type: ActionTypes.DELETE_PAIRING.FAILURE,
  payload: { error, meta }
});
