/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Cluster } from 'models/cluster.model';
import { BaseState } from 'models/base-resource-state';
import * as fromCluster from 'actions/cluster.action';
import { toEntities } from 'utils/store-util';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';

export type State = BaseState<Cluster>;

export const initialState: State = {
  entities: {}
};

const withStatus = (state, cluster) => {
  const cached = state.entities[cluster.id];
  const status = cached && cached.status || [];
  const healthStatus = cached && cached.healthStatus || CLUSTER_STATUS.UNKNOWN;
  return {
    ...cluster,
    healthStatus,
    status
  };
};

export function reducer(state = initialState, action: fromCluster.Actions): State {
  switch (action.type) {
    // TODO: figure out better way to link `status` object to `cluster` since they are recieved from different requests
    case fromCluster.ActionTypes.LOAD_CLUSTER.SUCCESS: {
      const cluster = withStatus(state, action.payload);
      return {
        entities: {
          ...state.entities,
          [cluster.id]: cluster
        }
      };
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS.SUCCESS: {
      const clusters = action.payload.response.clusters.map(cluster => withStatus(state, cluster));
      return {
        entities: Object.assign({}, state.entities, toEntities<Cluster>(clusters))
      };
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS_STATUSES.SUCCESS: {
      const clusterServices = {};
      if (action.payload.response.length) {
        action.payload.response.map(cluster => {
          const services = cluster.data.items || [];
          clusterServices[cluster.id] = services.map(item => item.ServiceInfo);
        });
      }
      const entities = Object.keys(state.entities).reduce((newEntities, clusterId) => {
        const status = clusterServices[clusterId];
        let clusterHealthStatus = CLUSTER_STATUS.HEALTHY;
        if (!status) {
          clusterHealthStatus = CLUSTER_STATUS.UNKNOWN;
        } else {
          if (status.some(d => d.state === SERVICE_STATUS.UNKNOWN)) {
            clusterHealthStatus = CLUSTER_STATUS.UNKNOWN;
          } else if (!!status.some(d => d.state !== SERVICE_STATUS.STARTED)) {
            clusterHealthStatus = CLUSTER_STATUS.UNHEALTHY;
          }
        }
        newEntities[clusterId] = Object.assign({}, state.entities[clusterId], {status: status || [], healthStatus: clusterHealthStatus});
        return newEntities;
      }, {});
      return {entities};
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS.FAILURE: {
      return state;
    }
    default: {
      return state;
    }
  }
}
