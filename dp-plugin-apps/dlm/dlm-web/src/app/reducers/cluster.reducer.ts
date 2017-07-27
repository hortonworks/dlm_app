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
  const status = state.entities[cluster.id] && state.entities[cluster.id].status || [];
  return {
    ...cluster,
    healthStatus: status.some(s => s.state !== SERVICE_STATUS.STARTED) ?
      CLUSTER_STATUS.UNHEALTHY :
      CLUSTER_STATUS.HEALTHY,
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
      action.payload.response.map(cluster => {
        clusterServices[cluster.id] = cluster.data.items.map(item => item.ServiceInfo);
      });
      const entities = Object.keys(state.entities).reduce((newEntities, clusterId) => {
        const status = clusterServices[clusterId];
        const someServiceIsNotStarted = status && !!status.find(d => d.state !== SERVICE_STATUS.STARTED);
        const clusterHealthStatus = someServiceIsNotStarted ? CLUSTER_STATUS.UNHEALTHY : CLUSTER_STATUS.HEALTHY;
        newEntities[clusterId] = Object.assign({}, state.entities[clusterId], {status, healthStatus: clusterHealthStatus});
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
