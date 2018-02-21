/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Effect, Actions, toPayload} from '@ngrx/effects';

import {
  loadBeaconCloudCredsFailure,
  loadBeaconCloudCredsSuccess,
  ActionTypes as beaconActions
} from 'actions/beacon-cloud-cred.action';
import {BeaconService} from 'services/beacon.service';

@Injectable()
export class BeaconCloudCredEffects {

  @Effect()
  loadBeaconCloudCreds$: Observable<any> = this.actions$
    .ofType(beaconActions.LOAD_BEACON_CLOUD_CREDS.START)
    .map(toPayload)
    .switchMap(payload => this.beaconService
      .fetchBeaconCloudCreds()
      .map(result => loadBeaconCloudCredsSuccess(result, payload.meta))
      .catch(err => Observable.of(loadBeaconCloudCredsFailure(err, payload.meta))));

  constructor(private actions$: Actions, private beaconService: BeaconService) {
  }
}
