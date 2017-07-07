import {NOTIFICATION_TYPES} from 'constants/notification.constant';

export interface ToastNotification {
  title?: string;
  body?: string;
  type: NOTIFICATION_TYPES;
  showIcon?: boolean;
}
