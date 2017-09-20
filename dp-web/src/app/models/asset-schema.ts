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

export class AssetSchema {
  name: string;
  type: string;
  noOfUniques: string;
  noOfNulls: string;
  max: string;
  min: string;
  mean: string;
  comment: string;
  guid?: string;
}

export class AssetModel {
  id: number;	
  assetType: string;
  assetName: string;
  guid: string;
  assetProperties: any;
  clusterId: number;
  datasetId: number;
}	