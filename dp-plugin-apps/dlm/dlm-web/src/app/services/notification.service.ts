/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { NOTIFICATION_TYPE_CLASSES, NOTIFICATION_TYPE_ICONS } from 'constants/notification.constant';
import { NotificationsService } from 'angular2-notifications';
import { ToastNotification } from 'models/toast-notification.model';

@Injectable()
export class NotificationService {
  notificationTypeClasses = NOTIFICATION_TYPE_CLASSES;

  create({title = '', body = '', type, showIcon = true}: ToastNotification) {
    const iconHTML = showIcon ? NOTIFICATION_TYPE_ICONS[type] : '';
    const message = `<div class="alert ` + this.notificationTypeClasses[type] + ` shadow-box">
        <div class="row">
          <div class="col-md-2">
            ` + iconHTML + `
          </div>
          <div class="col-md-10">
            <h4>` + title + `</h4>
            <p>` + body + `</p>
          </div>
        </div>
        </div>`;
    // Show a toast notification
    this.notificationsService.html(message, 'bare');
  }

  constructor(private notificationsService: NotificationsService) {}
}
