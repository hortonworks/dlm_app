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
import { CloudContainerService } from 'services/cloud-container.service';
import {
  loadContainersSuccess,
  loadContainersFail,
  ActionTypes as containerActions
} from 'actions/cloud-container.action';

@Injectable()
export class CloudContainersEffects {

  @Effect()
  loadContainers$: Observable<any> = this.actions$
    .ofType(containerActions.LOAD_CONTAINERS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.containerService.fetchContainersForAccounts(payload.accounts)
        .map(accounts => loadContainersSuccess(accounts, payload.meta))
        .catch(err => Observable.of(loadContainersFail(err, payload.meta)));
    });

  constructor(private actions$: Actions, private containerService: CloudContainerService) {
  }
}
