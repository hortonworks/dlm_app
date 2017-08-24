/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit } from '@angular/core';

import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { NotificationService, NotificationState } from 'services/notification.service';
import { NOTIFICATION_TIMEOUT } from 'constants/notification.constant';

@Component({
  selector: 'dlm-notifications-container',
  template: `
    <simple-notifications [options]="notificationOptions"></simple-notifications>
    <dlm-modal-dialog #notificationError
      [title]="'common.error'"
      [modalSize]="MODAL_SIZES.MEDIUM"
      [showDialog]="(notificationsState$ | async)?.activeErrorId ? true : false"
      [showCancel]="false"
      (onClose)="hideNotificationError()"
    >
      <dlm-modal-dialog-body>
        <pre>{{(notificationsState$ | async).errors[(notificationsState$ | async)?.activeErrorId]}}</pre>
      </dlm-modal-dialog-body>
    </dlm-modal-dialog>
  `,
  styles: []
})
export class NotificationsContainerComponent implements OnInit {
  MODAL_SIZES = ModalSize;
  notificationsState$: NotificationState;
  // Options for Toast Notification
  notificationOptions = {
    position: ['top', 'right'],
    showProgressBar: false,
    lastOnBottom: false,
    theClass: 'toast-notification',
    timeOut: NOTIFICATION_TIMEOUT
  };

  constructor(private notification: NotificationService) {
    this.notificationsState$ = notification.state$;
  }

  ngOnInit() {
  }

  hideNotificationError() {
    this.notification.hideError();
  }
}
