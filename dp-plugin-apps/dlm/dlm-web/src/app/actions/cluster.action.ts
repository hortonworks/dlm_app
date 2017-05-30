import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { Cluster } from 'models/cluster.model';

export const ActionTypes = {
  LOAD_CLUSTERS: requestType('LOAD_CLUSTERS'),
  LOAD_CLUSTER: type('LOAD_CLUSTER'),
  LOAD_CLUSTER_SUCCESS: type('LOAD_CLUSTER_SUCCESS'),
  LOAD_CLUSTER_FAILURE: type('LOAD_CLUSTER_FAILURE')
};

export class LoadClustersFailure implements Action {
  type = ActionTypes.LOAD_CLUSTERS.FAILURE;

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

export const loadClusters = (requestId?: string): Action => ({
  type: ActionTypes.LOAD_CLUSTERS.START,
  payload: {
    meta: { requestId }
  }
});

export const loadClustersSuccess = (clusters, meta): Action => ({
  type: ActionTypes.LOAD_CLUSTERS.SUCCESS,
  payload: { response: clusters, meta }
});

export const loadClustersFailure = (error, meta): Action => ({
  type: ActionTypes.LOAD_CLUSTERS.FAILURE,
  payload: { error, meta }
});

export type Actions
  = LoadCluster
  | LoadClusterSuccess;
