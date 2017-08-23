/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE} from 'constants/notification.constant';

export interface ToastNotification {
  id?: string;
  title?: string;
  body?: string;
  type: NOTIFICATION_TYPES;
  showIcon?: boolean;
  contentType?: NOTIFICATION_CONTENT_TYPE;
}
