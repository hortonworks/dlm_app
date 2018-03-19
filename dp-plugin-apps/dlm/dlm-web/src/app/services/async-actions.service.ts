/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ProgressState } from 'models/progress-state.model';

import * as fromRoot from 'reducers';
import { getProgressState } from 'selectors/progress.selector';
import { genId } from 'utils/string-utils';
import { ActionWithPayload } from 'actions/actions.type';
import { removeProgressState } from 'actions/progress.action';

@Injectable()
export class AsyncActionsService {

  constructor(private store: Store<fromRoot.State>) { }

  /**
   * Returns Observable that emits every time when progress state completes.
   *
   * @param progressStateOrId request id or ProgressState observable
   */
  onComplete(progressStateOrId: Observable<ProgressState> | string): Observable<ProgressState> {
    const progressState$ = progressStateOrId instanceof Observable ? progressStateOrId :
      this.store.select(getProgressState(progressStateOrId));
    return progressState$
      .filter(p => !!p)
      .distinctUntilKeyChanged<ProgressState>('isInProgress')
      .filter(p => !p.isInProgress);
  }

  /**
   * Setup and dispatch action that, basically, do some http request or any
   * async operations. Action supposed to have access to { payload: { meta } } object
   * so we can put `requestId` here and track it progress within progress reducer
   *
   * @param action action to dispatch
   * @returns observable that emits once on action finish
   */
  dispatch(action: ActionWithPayload<any>): Observable<ProgressState> {
    const requestId = genId();
    const meta = Object.assign({}, action.payload.meta || {}, {requestId});
    this.store.dispatch(Object.assign(action, { payload: { ...action.payload, meta } }));
    return this.onComplete(requestId)
      .take(1)
      .do(_ => this.store.dispatch(removeProgressState(requestId)));
  }
}
