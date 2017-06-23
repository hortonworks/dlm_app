export class AssetCountModel {
  allCount: number;
  filesCount: number;
  hiveCount: number;
}

export class RichDatasetModel {
  counts: AssetCountModel;
  creatorId: number;
  creatorName: string;
  description: string;
  datalakeId: number;
  datalakeName: string;
  favourite: boolean;
  id: number;
  name: string;
  clusterId?: number;
  tags?: string[];
}
