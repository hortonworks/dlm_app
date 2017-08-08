/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { Cluster } from 'models/cluster.model';

export const ActionTypes = {
  LOAD_CLUSTERS: requestType('LOAD_CLUSTERS'),
  LOAD_CLUSTERS_STATUSES: requestType('LOAD_CLUSTERS_STATUSES'),
  LOAD_CLUSTER: requestType('LOAD_CLUSTER')
};

export class LoadClustersFailure implements Action {
  type = ActionTypes.LOAD_CLUSTERS.FAILURE;

  constructor(public payload: string) {}
};

export class LoadCluster implements Action {
  type = ActionTypes.LOAD_CLUSTER.START;

  constructor(public entityId: string, public payload?: any) {}
};

export class LoadClusterSuccess implements Action {
  type = ActionTypes.LOAD_CLUSTER.SUCCESS;

  constructor(public payload: any) {}
};

export class LoadClusterFailure implements Action {
  type = ActionTypes.LOAD_CLUSTER.FAILURE;

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

export const loadClustersStatuses = (requestId?: string): Action => ({
  type: ActionTypes.LOAD_CLUSTERS_STATUSES.START,
  payload: {
    meta: { requestId }
  }
});

export const loadClustersStatusesSuccess = (clusters, meta): Action => ({
  type: ActionTypes.LOAD_CLUSTERS_STATUSES.SUCCESS,
  payload: { response: clusters, meta }
});

export const loadClustersStatusesFailure = (error, meta): Action => ({
  type: ActionTypes.LOAD_CLUSTERS_STATUSES.FAILURE,
  payload: { error, meta }
});

export type Actions
  = LoadCluster
  | LoadClusterSuccess;
