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
import { Observable } from 'rxjs/Observable';
import { ActionWithPayload } from 'actions/actions.type';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';

import { isCompletedAction, isSuccessAction, isFailureAction } from 'utils/type-action';
import { noop } from 'actions/app.action';
import { NotificationService } from 'services/notification.service';
import { NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE } from 'constants/notification.constant';
import { getError } from 'utils/http-util';
import { genId } from 'utils/string-utils';
import { ErrorPayload } from 'utils/extended-actions.type';

@Injectable()
export class NotificationEffects {

  @Effect()
  showNotification$ = this.actions$
    .filter(action => isCompletedAction(action) && this.hasNotification(action))
    .switchMap((action: ActionWithPayload<any>) => {
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
        const errorNotification = notification[NOTIFICATION_TYPES.ERROR];
        const translated = this.translateOptions(errorNotification);
        const options = {
          ...translated,
          type: NOTIFICATION_TYPES.ERROR,
          body: translated.body || this.getErrorBody(action),
          contentType: errorNotification.contentType || NOTIFICATION_CONTENT_TYPE.MODAL_LINK,
          id: genId()
        };
        this.notification.create(options);
      }
      return Observable.of(noop());
    });

  private hasNotification(action) {
    return action.payload.meta && 'notification' in action.payload.meta;
  }

  private getErrorBody(action: ActionWithPayload<ErrorPayload>) {
    const err = action.payload.error;
    const errorMessage = getError(err).message;
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
