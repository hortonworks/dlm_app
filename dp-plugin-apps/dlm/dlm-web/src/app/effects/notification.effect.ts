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
import { NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE } from 'constants/notification.constant';
import { getError } from 'utils/http-util';
import { genId } from 'utils/string-utils';

@Injectable()
export class NotificationEffects {

  @Effect()
  showNotification$ = this.actions$
    .filter(action => isCompletedAction(action) && this.hasNotification(action))
    .switchMap(action => {
      const payload = action.payload;
      const notification = payload.meta.notification;
      if (isSuccessAction(action) && NOTIFICATION_TYPES.SUCCESS in payload.meta.notification) {
        const options = {
          ...this.translateOptions(payload.meta.notification[NOTIFICATION_TYPES.SUCCESS]),
          type: NOTIFICATION_TYPES.SUCCESS
        };
        this.notification.create(options);
      }
      if (isFailureAction(action) && NOTIFICATION_TYPES.ERROR in payload.meta.notification) {
        const translated = this.translateOptions(payload.meta.notification[NOTIFICATION_TYPES.ERROR]);
        const options = {
          ...translated,
          type: NOTIFICATION_TYPES.ERROR,
          body: translated.body || this.getErrorBody(action),
          contentType: notification.contentType || NOTIFICATION_CONTENT_TYPE.MODAL_LINK,
          id: genId()
        };
        this.notification.create(options);
      }
      return Observable.of(noop());
    });

  private hasNotification(action) {
    return action.payload.meta && 'notification' in action.payload.meta;
  }

  private getErrorBody(action: Action) {
    const err = action.payload.error;
    let errorMessage = getError(err.json && typeof err.json === 'function' ? err.json() : err);
    if (errorMessage.message) {
      errorMessage = errorMessage.message;
    }
    return typeof errorMessage === 'string' ? this.t.instant(errorMessage) : JSON.stringify(errorMessage, null, 4);
  }

  private translateOptions(options) {
    const opts = {...options};
    if (options.title) {
      opts.title = this.t.instant(options.title);
    }
    if (options.body) {
      opts.body = this.t.instant(options.body);
    }
    return opts;
  }


  constructor(private actions$: Actions,
              private notification: NotificationService,
              private t: TranslateService) {}
}
