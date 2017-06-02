import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { HdfsService } from 'services/hdfs.service';
import { listFilesSuccess, listFilesFail, ActionTypes as hdfsListActions } from 'actions/hdfslist.action';

@Injectable()
export class HdfsListEffects {

  @Effect()
  listFiles$: Observable<any> = this.actions$
    .ofType(hdfsListActions.LIST_FILES.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.hdfsService.getFilesList(payload.clusterId, payload.path)
        .map(files => listFilesSuccess(files, payload.meta))
        .catch(err => Observable.of(listFilesFail(err, payload.meta)));
    });

  constructor(private actions$: Actions, private hdfsService: HdfsService) {
  }
}
