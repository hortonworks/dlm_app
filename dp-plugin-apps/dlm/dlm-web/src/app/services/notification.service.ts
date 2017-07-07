import { Injectable } from '@angular/core';
import { NOTIFICATION_TYPES, NOTIFICATION_TYPE_CLASSES, NOTIFICATION_TYPE_ICONS } from 'constants/notification.constant';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class NotificationService {
  notificationTypeClasses = NOTIFICATION_TYPE_CLASSES;

  create(title: string, body: string, type: NOTIFICATION_TYPES, showIcon = true) {
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
