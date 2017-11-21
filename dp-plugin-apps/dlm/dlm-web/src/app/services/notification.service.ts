/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NOTIFICATION_TYPE_CLASSES, NOTIFICATION_TYPE_ICONS, NOTIFICATION_TIMEOUT } from 'constants/notification.constant';
import { NOTIFICATION_CONTENT_TYPE, NOTIFICATION_TYPES } from 'constants/notification.constant';
import { NotificationsService } from 'angular2-notifications';
import { ToastNotification } from 'models/toast-notification.model';

export interface State {
  // map of notification id -> error content
  errors: {[notificationId: string]: any};
  // error to be shown
  activeErrorId: null|string;
};

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
        <div class="row">
          <div class="col-xs-2">
            ` + iconHTML + `
          </div>
          <div class="col-xs-8">
            <h4>` + title + `</h4>
            <p>` + this.makeNotificationBody(id, body, contentType) + `</p>
          </div>
          <div class="col-xs-2">
            <i class="fa fa-close fa-stack-1x"></i>
          </div>
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
