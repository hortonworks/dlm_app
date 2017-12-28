/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const NOTIFICATION_TIMEOUT = 10000;

export enum NOTIFICATION_TYPES {
  INFO,
  WARNING,
  ERROR,
  ALERT,
  SUCCESS
}

export const NOTIFICATION_TYPE_ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: '<i class="fa fa-check-circle-o notify-icon" aria-hidden="true"></i>',
  [NOTIFICATION_TYPES.ALERT]: '<i class="fa fa-bell notify-icon" aria-hidden="true"></i>',
  [NOTIFICATION_TYPES.ERROR]: '<i class="fa fa-exclamation-triangle notify-icon" aria-hidden="true"></i>',
  [NOTIFICATION_TYPES.INFO]: '<i class="fa fa-info-circle notify-icon" aria-hidden="true"></i>',
  [NOTIFICATION_TYPES.WARNING]: '<i class="fa fa-exclamation-circle notify-icon" aria-hidden="true"></i>'
};

export const NOTIFICATION_TYPE_CLASSES = {
  [NOTIFICATION_TYPES.SUCCESS]: 'alert-success',
  [NOTIFICATION_TYPES.ALERT]: 'alert-info',
  [NOTIFICATION_TYPES.ERROR]: 'alert-danger',
  [NOTIFICATION_TYPES.INFO]: 'alert-info',
  [NOTIFICATION_TYPES.WARNING]: 'alert-warning'
};


export enum NOTIFICATION_CONTENT_TYPE {
  INLINE,
  MODAL_LINK
}
