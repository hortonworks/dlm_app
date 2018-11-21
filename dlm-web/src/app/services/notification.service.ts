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
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { NOTIFICATION_TYPE_CLASSES, NOTIFICATION_TYPE_ICONS, NOTIFICATION_TIMEOUT } from 'constants/notification.constant';
import { NOTIFICATION_CONTENT_TYPE, NOTIFICATION_TYPES } from 'constants/notification.constant';
import { NotificationsService } from 'angular2-notifications';
import { ToastNotification } from 'models/toast-notification.model';

export interface State {
  // map of notification id -> error content
  errors: {[notificationId: string]: any};
  // error to be shown
  activeErrorId: null|string;
}

export type NotificationState = BehaviorSubject<State>;

export const defaultState: NotificationState = new BehaviorSubject({
  errors: {},
  activeErrorId: null
});

const defaultContentType = NOTIFICATION_CONTENT_TYPE.INLINE;

@Injectable()
export class NotificationService {
  private linkClassName = 'system-notification-link';

  notificationTypeClasses = NOTIFICATION_TYPE_CLASSES;
  state$: NotificationState = defaultState;

  get state(): State {
    return this.state$.getValue();
  }

  create({id = '', title = '', body = '', type, showIcon = true, contentType = defaultContentType}: ToastNotification) {
    const iconHTML = showIcon ? NOTIFICATION_TYPE_ICONS[type] : '';
    const message = `
      <div class="alert ` + this.notificationTypeClasses[type] + ` shadow-box">
        <div class="alert-icon-container">
          ` + iconHTML + `
        </div>
        <div class="alert-content">
          <h4 class="alert-content-title">` + title + `</h4>
          <p class="alert-content-body">` + this.makeNotificationBody(id, body, contentType) + `</p>
        </div>
        <div class="alert-close">
          <i class="fa fa-close"></i>
        </div>
      </div>
    `;
    const override = {
      id,
      // make errors persisted so user won't miss it
      timeOut: NOTIFICATION_TYPES.ERROR === type ? 0 : NOTIFICATION_TIMEOUT
    };
    // Show a toast notification
    const notification = this.notificationsService.html(message, 'bare', override);
    if (contentType === NOTIFICATION_CONTENT_TYPE.MODAL_LINK) {
      this.addError(id, body);
      notification.click.subscribe(e => {
        if (e.target.classList.contains(this.linkClassName)) {
          this.showError(id, e);
        }
      });
    }
  }

  hideError() {
    if (this.state.activeErrorId) {
      const { [this.state.activeErrorId]: _, ...errors} = this.state.errors;
      this.updateState({ activeErrorId: null, errors });
    }
  }

  private makeNotificationBody(id: string, body: string, contentType: NOTIFICATION_CONTENT_TYPE) {
    if (contentType === NOTIFICATION_CONTENT_TYPE.MODAL_LINK) {
      return `
        <span class="link ${this.linkClassName}">
          ${this.t.instant('notification_body.click_details')}
        </span>
      `;
    }
    return body;
  }

  private updateState(newState) {
    this.state$.next({
      ...this.state,
      ...newState
    });
  }

  private addError(id, body) {
    this.updateState({
      errors: {
        ...this.state.errors,
        [id]: body
      }
    });
  }

  private showError(id, e: MouseEvent) {
    this.updateState({ activeErrorId: id });
  }

  constructor(private notificationsService: NotificationsService, private t: TranslateService) {}
}
