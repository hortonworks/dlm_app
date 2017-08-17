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
import { PairingService } from 'services/pairing.service';

import {
  loadPairingsSuccess, loadPairingsFail, createPairingSuccess, createPairingFail,
  deletePairingSuccess, deletePairingFail, ActionTypes as pairingActions
} from 'actions/pairing.action';

@Injectable()
export class PairingEffects {

  @Effect()
  loadPairings$: Observable<any> = this.actions$
    .ofType(pairingActions.LOAD_PAIRINGS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.pairingService.fetchPairings()
        .map(pairings => loadPairingsSuccess(pairings, payload.meta))
        .catch(err => Observable.of(loadPairingsFail(err, payload.meta)));
    });

  @Effect()
  createPairing$: Observable<any> = this.actions$
    .ofType(pairingActions.CREATE_PAIRING.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.pairingService.createPairing(payload.pairing)
        .map(response => {
          return createPairingSuccess({...response, payload: payload.pairing}, payload.meta);
        })
        .catch(err => Observable.of(createPairingFail(err, payload.meta)));
    });

  @Effect()
  deletePairing$: Observable<any> = this.actions$
    .ofType(pairingActions.DELETE_PAIRING.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.pairingService.deletePairing(payload.pairing)
        .map(response => {
          return deletePairingSuccess({...response, payload: payload.pairing}, payload.meta);
        })
        .catch(err => Observable.of(deletePairingFail(err, payload.meta)));
    });

  constructor(private actions$: Actions, private pairingService: PairingService) { }
}
