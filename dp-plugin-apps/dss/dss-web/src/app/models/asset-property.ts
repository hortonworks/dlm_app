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

export class AssetProperty {
  constructor(public key: string, public value?: string) {
  }
}

export class AssetEntityParameters {
  totalSize:             string;
  rawDataSize:           string;
  EXTERNAL:              string;
  numRows:               string;
  numFiles:              string;
  transient_lastDdlTime: string;
  department:            string;
}

export class AssetEntityColumn {
  guid:     string;
  typeName: string;
}

export class AssetEntityClassification {
  typeName: string;
  attributes: any;
}

export class AssetEntityAttributes {
  owner:            string;
  temporary:        boolean;
  lastAccessTime:   number;
  aliases:          null;
  qualifiedName     = '';
  columns:          AssetEntityColumn[] = [];
  description:      null;
  viewExpandedText: null;
  sd:               AssetEntityColumn = new AssetEntityColumn();
  tableType:        string;
  createTime:       number;
  name:             string;
  comment:          null;
  partitionKeys:    null;
  profileData:      null;
  parameters:       AssetEntityParameters = new AssetEntityParameters();
  db:               AssetEntityColumn = new AssetEntityColumn();
  retention:        number;
  viewOriginalText: null;
}

export class AssetEntity {
  id:              string;
  typeName:        string;
  attributes:      AssetEntityAttributes = new AssetEntityAttributes();
  guid:            string;
  status:          string;
  createdBy:       string;
  updatedBy:       string;
  createTime:      number;
  updateTime:      number;
  version:         number;
  classifications: AssetEntityClassification[] = [];
}

export class AssetDetails {
  referredEntities: any;
  entity: AssetEntity = new AssetEntity();
}
