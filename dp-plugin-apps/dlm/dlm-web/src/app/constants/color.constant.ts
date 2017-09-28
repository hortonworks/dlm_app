/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { CLUSTER_STATUS, SERVICE_STATUS } from './status.constant';

export const GREEN = '#3FAE2A';
export const RED = '#EF6162';
export const YELLOW = '#FFD13D';
export const ORANGE = '#E98A40';

export const CLUSTER_STATUS_COLOR = {
  [CLUSTER_STATUS.HEALTHY]: GREEN,
  [CLUSTER_STATUS.UNHEALTHY]: RED,
  [CLUSTER_STATUS.WARNING]: ORANGE,
  [CLUSTER_STATUS.UNKNOWN]: YELLOW
};

export const SERVICE_STATUS_COLOR = {
  [SERVICE_STATUS.INSTALLED]: RED,
  [SERVICE_STATUS.STARTED]: GREEN,
  [SERVICE_STATUS.UNKNOWN]: YELLOW
};
