/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export interface YarnQueue {
  name: string;
  path: string;
  children: YarnQueue[];
}

export interface YarnQueueResponse {
  items: YarnQueue[];
}

export interface YarnQueueStore {
  [clusterId: number]: YarnQueue[];
}
