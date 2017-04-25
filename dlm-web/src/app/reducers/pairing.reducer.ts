import { Pairing } from '../models/pairing.model';
import { BaseState } from '../models/base-resource-state';
import * as fromPairing from '../actions/pairing.action';

export type State = BaseState<Pairing>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromPairing.ActionTypes.LOAD_PAIRINGS_SUCCESS: {
      const pairings = action.payload.pairings;
      const pairingEntities = pairings.reduce((entities: {[id: string]: Pairing}, entity: Pairing) => {
        return Object.assign({}, entities, {
          [entity.id]: entity
        });
      }, {});
      return {
        entities: Object.assign({}, state.entities, pairingEntities)
      };
    }
    case fromPairing.ActionTypes.DELETE_PAIRING_SUCCESS: {
      const entities = Object.assign({}, state.entities);
      delete entities[action.payload.pairingId];
      return {
        entities: Object.assign({}, entities)
      };
    }
    case fromPairing.ActionTypes.LOAD_PAIRINGS_FAILURE:
    case fromPairing.ActionTypes.DELETE_PAIRING_FAILURE:
    default: {
      return state;
    }
  }
}
