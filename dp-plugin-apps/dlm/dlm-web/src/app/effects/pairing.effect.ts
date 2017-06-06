import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { go } from '@ngrx/router-store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { PairingService } from '../services/pairing.service';

import {
  loadPairingsSuccess, loadPairingsFail, createPairingSuccess, createPairingFail,
  deletePairingSuccess, deletePairingFail, ActionTypes as pairingActions
} from '../actions/pairing.action';

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
      return this.pairingService.createPairing(payload)
        .map(response => {
          response['payload'] = payload;
          return createPairingSuccess(response);
        })
        .catch(err => Observable.of(createPairingFail(err)));
    });

  @Effect()
  deletePairing$: Observable<any> = this.actions$
    .ofType(pairingActions.DELETE_PAIRING.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.pairingService.deletePairing(payload)
        .map(response => {
          response['payload'] = payload;
          return deletePairingSuccess(response);
        })
        .catch(err => Observable.of(deletePairingFail(err)));
    });

  constructor(private actions$: Actions, private pairingService: PairingService) { }
}
