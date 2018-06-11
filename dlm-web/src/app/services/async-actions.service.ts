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
