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
  datalakeId: number; // datalakeId and dpClusterId are same thing
  datalakeName: string;
  favourite: boolean; // not related to favourite and bookmark (below)
  id: number;
  name: string;
  clusterId?: number;  // cluster id as discovered_cluster id
  tags?: string[];
  createdOn?: string;
  lastModified?: string;
  active?: boolean;
  version?: number;
  customProps?: any;
  sharedStatus?: number; // 1 public, 2 private
  favouriteId?: number;
  favouriteCount?: number;
  bookmarkId?: number;
}

export class Favourite {
  id: number;
  userId: number;
  objectType: string;
  objectId: number;
}

export class FavouriteWithTotal {
  favourite: Favourite;
  totalFavCount: number;
}

export class Bookmark {
  id: number;
  userId: number;
  objectType: string;
  objectId: number;
}
