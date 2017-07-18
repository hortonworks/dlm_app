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
