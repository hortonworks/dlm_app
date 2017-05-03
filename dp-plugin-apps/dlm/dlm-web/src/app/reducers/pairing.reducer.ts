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
    case fromPairing.ActionTypes.LOAD_PAIRINGS_SUCCESS: {
      const pairings = action.payload.pairedClusters;
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
    case fromPairing.ActionTypes.CREATE_PAIRING_SUCCESS: {
      const requestPayload = action.payload.payload;
      return {
        entities: Object.assign({}, state.entities),
        progress: Object.assign({}, state.progress, {
          state: 'success'
        })
      };
    }
    case fromPairing.ActionTypes.DELETE_PAIRING_SUCCESS: {
      const entities = Object.assign({}, state.entities);
      delete entities[action.payload.pairingId];
      return {
        entities: Object.assign({}, entities),
        progress: Object.assign({}, state.progress)
      };
    }
    case fromPairing.ActionTypes.LOAD_PAIRINGS_FAILURE:
    case fromPairing.ActionTypes.DELETE_PAIRING_FAILURE:
    default: {
      return state;
    }
  }
}
