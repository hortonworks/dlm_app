/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

export class DsAssetModel {
  creationTime: string;
  id: number;
  name: string;
  description?: string;
  owner: string;
  source: string;
  type: string;
  clusterId:number;
  dsName?: string;
  dbName?: string;
}