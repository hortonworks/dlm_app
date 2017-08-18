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
import { Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';

import { isCompletedAction, isSuccessAction, isFailureAction } from 'utils/type-action';
import { noop } from 'actions/app.action';
import { NotificationService } from 'services/notification.service';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { getError } from 'utils/http-util';

@Injectable()
export class NotificationEffects {

  @Effect()
  showNotification$ = this.actions$
    .filter(action => isCompletedAction(action) && this.hasNotification(action))
    .switchMap(action => {
      const payload = action.payload;
      if (isSuccessAction(action) && NOTIFICATION_TYPES.SUCCESS in payload.meta.notification) {
        const options = {
          ...payload.meta.notification[NOTIFICATION_TYPES.SUCCESS],
          type: NOTIFICATION_TYPES.SUCCESS
        };
        this.notification.create(options);
      }
      if (isFailureAction(action) && NOTIFICATION_TYPES.ERROR in payload.meta.notification) {
        const options = {
          ...payload.meta.notification[NOTIFICATION_TYPES.ERROR],
          type: NOTIFICATION_TYPES.ERROR,
          // todo: body content depends on layout. We need to display link which opens modal with error info
          body: this.getErrorBody(action)
        };
        this.notification.create(options);
      }
      return Observable.of(noop());
    });

  private hasNotification(action) {
    return action.payload.meta && 'notification' in action.payload.meta;
  }

  private getErrorBody(action: Action) {
    const errorMessage = getError(action.payload.error);
    return typeof errorMessage === 'string' ? this.t.instant(errorMessage) : errorMessage;
  }

  constructor(private actions$: Actions,
              private notification: NotificationService,
              private t: TranslateService) {}
}
