/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { YarnService } from 'services/yarn.service';
import { YarnQueueResponse } from 'models/yarnqueues.model';
import { loadYarnQueuesFailure, loadYarnQueuesSuccess, ActionTypes } from 'actions/yarnqueues.action';

@Injectable()
export class YarnEffects {
  @Effect()
  loadYarnQueues$: Observable<any> = this.actions$
    .ofType(ActionTypes.LOAD_YARN_QUEUES.START)
    .map(toPayload)
    .switchMap(({clusterId, meta}) =>
      this.yarnService.fetchYarnQueues(clusterId)
        .map(response => loadYarnQueuesSuccess({response, clusterId}, meta))
        .catch(err => Observable.of(loadYarnQueuesFailure(err, meta))));

  constructor(private actions$: Actions, private yarnService: YarnService) { }
}
