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

import { loadBeaconAdminStatusSuccess, loadBeaconAdminStatusFailure, ActionTypes as beaconActions } from 'actions/beacon.action';
import { BeaconService } from 'services/beacon.service';

@Injectable()
export class BeaconEffects {

  @Effect()
  loadBeaconAdminStatus$: Observable<any> = this.actions$
    .ofType(beaconActions.LOAD_BEACON_ADMIN_STATUS.START)
    .map(toPayload)
    .switchMap(payload => this.beaconService
      .fetchBeaconAdminStatus()
      .map(result => loadBeaconAdminStatusSuccess(result, payload.meta))
      .catch(err => Observable.of(loadBeaconAdminStatusFailure(err, payload.meta))));

  constructor(private actions$: Actions, private beaconService: BeaconService) {}
}
