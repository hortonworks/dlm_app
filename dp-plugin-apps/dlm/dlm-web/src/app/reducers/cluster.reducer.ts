import { Cluster } from '../models/cluster.model';
import { BaseState } from '../models/base-resource-state';
import * as fromCluster from '../actions/cluster.action';

export type State = BaseState<Cluster>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action: fromCluster.Actions): State {
  switch (action.type) {
    case fromCluster.ActionTypes.LOAD_CLUSTER_SUCCESS: {
      const cluster = action.payload;
      return {
        entities: {
          ...state.entities,
          [cluster.id]: cluster
        }
      };
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS_SUCCESS: {
      const clusters = action.payload.clusters;
      const clusterEntities = clusters.reduce((entities: { [id: string]: Cluster}, entity: Cluster) => {
        return Object.assign({}, entities, {
          [entity.id]: entity
        });
      }, {});
      return {
        entities: Object.assign({}, state.entities, clusterEntities)
      };
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS_FAILURE: {
      return state;
    }
    default: {
      return state;
    }
  }
}
