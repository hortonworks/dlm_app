import { type } from '../utils/type-action';
import { Action } from '@ngrx/store';

export const ActionTypes = {
  LOAD_PAIRINGS: type('LOAD_PAIRINGS'),
  LOAD_PAIRINGS_SUCCESS: type('LOAD_PAIRINGS_SUCCESS'),
  LOAD_PAIRINGS_FAILURE: type('LOAD_PAIRINGS_FAILURE'),

  CREATE_PAIRING: type('CREATE_PAIRING'),
  CREATE_PAIRING_SUCCESS: type('CREATE_PAIRING_SUCCESS'),
  CREATE_PAIRING_FAILURE: type('CREATE_PAIRING_FAILURE'),

  DELETE_PAIRING: type('DELETE_PAIRING'),
  DELETE_PAIRING_SUCCESS: type('DELETE_PAIRING_SUCCESS'),
  DELETE_PAIRING_FAILURE: type('DELETE_PAIRING_FAILURE')
};

export const loadPairings = (): Action => ({type: ActionTypes.LOAD_PAIRINGS});
export const loadPairingsSuccess = (pairings): Action => ({type: ActionTypes.LOAD_PAIRINGS_SUCCESS, payload: pairings});
export const loadPairingsFail = (error): Action => ({type: ActionTypes.LOAD_PAIRINGS_FAILURE});

export const createPairing = (pairing): Action => ({type: ActionTypes.CREATE_PAIRING, payload: pairing});
export const createPairingSuccess = (payload): Action => ({type: ActionTypes.CREATE_PAIRING_SUCCESS, payload});
export const createPairingFail = (error): Action => ({type: ActionTypes.CREATE_PAIRING_FAILURE, payload: error});

export const deletePairing = (pairingId): Action => ({type: ActionTypes.DELETE_PAIRING, payload: pairingId});
export const deletePairingSuccess = (payload): Action => ({type: ActionTypes.DELETE_PAIRING_SUCCESS, payload});
export const deletePairingFail = (error): Action => ({type: ActionTypes.DELETE_PAIRING_FAILURE, payload: error});
