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
