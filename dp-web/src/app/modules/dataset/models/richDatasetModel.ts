export class AssetCountModel {
  allCount:number;
  hiveCount:number;
  filesCount:number;
}

export class RichDatasetModel {
  id:number;
  name: string;
  description: string;
  datalakeId: number;
  datalakeName: string;
  creatorId: number;
  creatorName: string;
  favourite:boolean;
  counts:AssetCountModel;
}
