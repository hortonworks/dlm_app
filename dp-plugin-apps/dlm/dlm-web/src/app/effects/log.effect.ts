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
import { LogService } from 'services/log.service';
import { loadLogsSuccess, loadLogsFail, ActionTypes as logActions } from 'actions/log.action';

@Injectable()
export class LogEffects {

  @Effect()
  loadLogs$: Observable<any> = this.actions$
    .ofType(logActions.LOAD_LOGS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.logService.getLogs(payload.clusterId, payload.instanceId, payload.logType)
        .map(jobs => loadLogsSuccess(jobs, payload.meta))
        .catch(err => Observable.of(loadLogsFail(err, payload.meta)));
    });

  constructor(private actions$: Actions, private logService: LogService) {
  }
}
