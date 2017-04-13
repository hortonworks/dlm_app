import { Policy } from '../models/policy.model';
import { BaseState } from '../models/base-resource-state';
import * as fromPolicy from '../actions/policy';

export type State = BaseState<Policy>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action: fromPolicy.Actions): State {
  switch (action.type) {
    case fromPolicy.ActionTypes.LOAD_POLICIES_SUCCESS: {
      const policies = action.payload.policy;
      const policyEntities = policies.reduce((entities: { [id: string]: Policy}, entity: Policy) => {
        return Object.assign({}, entities, {
          [entity.id]: entity
        });
      }, {});
      return {
        entities: Object.assign({}, state.entities, policyEntities)
      };
    }
    default: {
      return state;
    }
  }
}
