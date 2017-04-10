import { type } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { Cluster } from '../models/cluster.model';

export const ActionTypes = {
  LOAD_CLUSTERS: type('LOAD_CLUSTERS'),
  LOAD_CLUSTERS_SUCCESS: type('LOAD_CLUSTERS_SUCCESS'),
  LOAD_CLUSTERS_FAILURE: type('LOAD_CLUSTERS_FAILURE')
};

export class LoadClusters implements Action {
  type = ActionTypes.LOAD_CLUSTERS;

  constructor(public payload?: string) {}
};

export class LoadClustersSuccess implements Action {
  type = ActionTypes.LOAD_CLUSTERS_SUCCESS;

  constructor(public payload: any) { }
};

export class LoadClustersFailure implements Action {
  type = ActionTypes.LOAD_CLUSTERS_FAILURE;

  constructor(public payload: string) {}
};

export type Actions
  = LoadClusters
  | LoadClustersSuccess
  | LoadClustersFailure;
