import {AssetSetQueryModel} from '../modules/dataset/views/ds-assets-list/ds-assets-list.component';

export class WorkspaceAsset {
  workspaceId: number;
  clusterId : number;
  assetQueryModels: AssetSetQueryModel[];

  id: number;
  assetType: string;
  assetName: string;
  guid: string;
  assetProperties: {
    name: string
  }
}