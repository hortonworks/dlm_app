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

import {AssetSetQueryModel} from '../modules/dataset/views/ds-assets-list/ds-assets-list.component';

export class WorkspaceAsset {
  workspaceId: number;
  clusterId : number;
  // assetQueryModels: AssetSetQueryModel[];
  assetQueryModels: any[];

  id: number;
  assetType: string;
  assetName: string;
  description: string = '';
  guid: string;
  assetProperties: {
    name: string
  };

}
