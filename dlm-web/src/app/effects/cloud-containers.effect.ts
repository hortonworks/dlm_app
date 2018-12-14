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


import {of as observableOf,  Observable } from 'rxjs';

import {catchError, switchMap, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { CloudContainerService } from 'services/cloud-container.service';
import {
  loadContainersSuccess,
  loadContainersFail,
  loadContainerDirSuccess,
  loadContainerDirFail,
  ActionTypes as containerActions
} from 'actions/cloud-container.action';
import { toPayload } from 'models/to-pay-load.model';

@Injectable()
export class CloudContainersEffects {

  @Effect()
  loadContainers$: Observable<any> = this.actions$
    .ofType(containerActions.LOAD_CONTAINERS.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.containerService.fetchContainersForAccounts(payload.accounts).pipe(
        map(containers => loadContainersSuccess(containers, payload.meta)),
        catchError(err => observableOf(loadContainersFail(err, payload.meta))), );
    }), );

  @Effect()
  loadDir$: Observable<any> = this.actions$
    .ofType(containerActions.LOAD_DIR.START).pipe(
    map<Action, any>(toPayload),
    switchMap(payload => {
      return this.containerService.fetchContainerDir(payload.container, payload.path).pipe(
        map(dirContent => loadContainerDirSuccess(dirContent, payload.meta)),
        catchError(err => observableOf(loadContainerDirFail(err, payload.meta))), );
    }), );

  constructor(private actions$: Actions, private containerService: CloudContainerService) {
  }
}
