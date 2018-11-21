/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { requestType, createRequestAction } from '../utils/type-action';
import { ActionWithPayload } from './actions.type';

export const ActionTypes = {
  LOAD_CLUSTERS: requestType('LOAD_CLUSTERS'),
  LOAD_CLUSTERS_STATUSES: requestType('LOAD_CLUSTERS_STATUSES'),
  LOAD_STALE_CLUSTERS: requestType('LOAD_STALE_CLUSTERS'),
  SYNC_CLUSTER: requestType('SYNC_CLUSTER')
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

export const {
  loadStaleClusters,
  loadStaleClustersSuccess,
  loadStaleClustersFailure
} = createRequestAction(ActionTypes.LOAD_STALE_CLUSTERS);

export const {
  syncCluster,
  syncClusterSuccess,
  syncClusterFailure
} = createRequestAction(ActionTypes.SYNC_CLUSTER, {
  start: (clusterId: number, meta = {}) => ({ meta, clusterId })
});
