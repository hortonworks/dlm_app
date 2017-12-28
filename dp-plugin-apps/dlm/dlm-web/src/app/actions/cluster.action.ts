/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type, requestType } from '../utils/type-action';
import { ActionWithPayload } from './actions.type';
import { Cluster } from 'models/cluster.model';

export const ActionTypes = {
  LOAD_CLUSTERS: requestType('LOAD_CLUSTERS'),
  LOAD_CLUSTERS_STATUSES: requestType('LOAD_CLUSTERS_STATUSES')
};

export class LoadClustersFailure implements ActionWithPayload<any> {
  type = ActionTypes.LOAD_CLUSTERS.FAILURE;

  constructor(public payload: string) {}
}

export const loadClusters = (requestId?: string): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_CLUSTERS.START,
  payload: {
    meta: { requestId }
  }
});

export const loadClustersSuccess = (clusters, meta): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_CLUSTERS.SUCCESS,
  payload: { response: clusters, meta }
});

export const loadClustersFailure = (error, meta): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_CLUSTERS.FAILURE,
  payload: { error, meta }
});

export const loadClustersStatuses = (requestId?: string): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_CLUSTERS_STATUSES.START,
  payload: {
    meta: { requestId }
  }
});

export const loadClustersStatusesSuccess = (clusters, meta): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_CLUSTERS_STATUSES.SUCCESS,
  payload: { response: clusters, meta }
});

export const loadClustersStatusesFailure = (error, meta): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_CLUSTERS_STATUSES.FAILURE,
  payload: { error, meta }
});
