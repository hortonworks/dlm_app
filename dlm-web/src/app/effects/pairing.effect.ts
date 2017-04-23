import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { go } from '@ngrx/router-store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { PairingService } from '../services/pairing.service';

import {
  loadPairingsSuccess, loadPairingsFail, createPairingSuccess, createPairingFail, ActionTypes as pairingActions
} from '../actions/pairing.action';

@Injectable()
export class PairingEffects {

  @Effect()
  loadPairings$: Observable<any> = this.actions$
    .ofType(pairingActions.LOAD_PAIRINGS)
    .switchMap(() => {
      return this.pairingService.fetchPairings()
        .map(pairings => loadPairingsSuccess(pairings))
        .catch(err => Observable.of(loadPairingsFail(err)));
    });

  @Effect()
  createPairing$: Observable<any> = this.actions$
    .ofType(pairingActions.CREATE_PAIRING)
    .map(toPayload)
    .switchMap((payload) => {
      return this.pairingService.createPairing(payload)
        .mergeMap(response => [
          createPairingSuccess(response),
          go(['/policies'])
        ])
        .catch(err => Observable.of(createPairingFail(err)));
    });

  constructor(private actions$: Actions, private pairingService: PairingService) { }
}
