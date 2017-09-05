/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { CLUSTER_STATUS } from './status.constant';

export const CLUSTER_STATUS_COLOR = {
  [CLUSTER_STATUS.HEALTHY]: '#3FAE2A',
  [CLUSTER_STATUS.UNHEALTHY]: '#EF6162',
  [CLUSTER_STATUS.WARNING]: '#E98A40',
  [CLUSTER_STATUS.UNKNOWN]: '#FFD13D'
};
