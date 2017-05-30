import { Pairing } from '../models/pairing.model';
import * as fromPairing from '../actions/pairing.action';
import { Cluster } from 'models/cluster.model';
import {BaseState} from 'models/base-resource-state';

export interface State extends BaseState<Pairing> {
  progress: {
    state: string;
  };
}

export const initialState: State = {
  entities: {},
  progress: {
    state: 'initial'
  }
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromPairing.ActionTypes.LOAD_PAIRINGS.SUCCESS: {
      const pairings = action.payload.response.pairedClusters;
      const pairingEntities = pairings.reduce((entities: {[id: string]: Pairing}, entity: [Cluster, Cluster]) => {
        const id = entity[0]['id'] + '-' + entity[1]['id'];
        return Object.assign({}, entities, {
          [id]: {
            'id': id,
            'pair': entity
          }
        });
      }, {});
      return {
        entities: Object.assign({}, state.entities, pairingEntities),
        progress: Object.assign({}, initialState.progress)
      };
    }
    case fromPairing.ActionTypes.CREATE_PAIRING.SUCCESS: {
      return {
        entities: Object.assign({}, state.entities),
        progress: Object.assign({}, state.progress, {
          state: 'success'
        })
      };
    }
    case fromPairing.ActionTypes.DELETE_PAIRING.SUCCESS: {
      const entities = Object.assign({}, state.entities);
      const key = action.payload.payload[0].clusterId + '-' + action.payload.payload[1].clusterId;
      delete entities[key];
      return {
        entities: Object.assign({}, entities),
        progress: Object.assign({}, state.progress)
      };
    }
    case fromPairing.ActionTypes.LOAD_PAIRINGS.FAILURE:
    case fromPairing.ActionTypes.DELETE_PAIRING.FAILURE:
    default: {
      return state;
    }
  }
}
