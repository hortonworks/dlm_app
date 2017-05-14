import { type } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { Cluster } from '../models/cluster.model';

export const ActionTypes = {
  LOAD_CLUSTERS: type('LOAD_CLUSTERS'),
  LOAD_CLUSTERS_SUCCESS: type('LOAD_CLUSTERS_SUCCESS'),
  LOAD_CLUSTERS_FAILURE: type('LOAD_CLUSTERS_FAILURE'),
  LOAD_CLUSTER: type('LOAD_CLUSTER'),
  LOAD_CLUSTER_SUCCESS: type('LOAD_CLUSTER_SUCCESS'),
  LOAD_CLUSTER_FAILURE: type('LOAD_CLUSTER_FAILURE')
};

export class LoadClusters implements Action {
  type = ActionTypes.LOAD_CLUSTERS;

  constructor(public payload?: string) {}
};

export class LoadClustersSuccess implements Action {
  type = ActionTypes.LOAD_CLUSTERS_SUCCESS;

  constructor(public payload: {clusters: Cluster[]}) { }
};

export class LoadClustersFailure implements Action {
  type = ActionTypes.LOAD_CLUSTERS_FAILURE;

  constructor(public payload: string) {}
};

export class LoadCluster implements Action {
  type = ActionTypes.LOAD_CLUSTER;

  constructor(public entityId: string, public payload?: any) {}
};

export class LoadClusterSuccess implements Action {
  type = ActionTypes.LOAD_CLUSTER_SUCCESS;

  constructor(public payload: any) {}
};

export class LoadClusterFailure implements Action {
  type = ActionTypes.LOAD_CLUSTER_FAILURE;

  constructor(public payload: string) {}
};

export const loadClusters = (): Action => new LoadClusters();

export type Actions
  = LoadClusters
  | LoadClustersSuccess
  | LoadClustersFailure
  | LoadCluster
  | LoadClusterSuccess;
