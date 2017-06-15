import { Cluster } from '../models/cluster.model';
import { BaseState } from '../models/base-resource-state';
import * as fromCluster from '../actions/cluster.action';
import { toEntities } from 'utils/store-util';

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
    case fromCluster.ActionTypes.LOAD_CLUSTERS.SUCCESS: {
      const clusters = action.payload.response.clusters;
      return {
        entities: Object.assign({}, state.entities, toEntities<Cluster>(clusters))
      };
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS.FAILURE: {
      return state;
    }
    default: {
      return state;
    }
  }
}
