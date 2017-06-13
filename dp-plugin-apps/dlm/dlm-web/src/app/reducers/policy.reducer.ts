import { Policy } from 'models/policy.model';
import { BaseState } from 'models/base-resource-state';
import * as fromPolicy from 'actions/policy.action';
import { toEntities } from 'utils/store-util';

export type State = BaseState<Policy>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromPolicy.ActionTypes.LOAD_POLICIES.SUCCESS:
      return loadPoliciesSuccess(state, action);

    case fromPolicy.ActionTypes.DELETE_POLICY.SUCCESS:
      return deletePolicySuccess(state, action);

    case fromPolicy.ActionTypes.SUSPEND_POLICY.SUCCESS:
      return suspendPolicySuccess(state, action);

    case fromPolicy.ActionTypes.RESUME_POLICY.SUCCESS:
      return resumePolicySuccess(state, action);

    default:
      return state;
  }
}

function loadPoliciesSuccess(state: State, action): State {
  const policies = action.payload.response.policies;
  return {
    entities: Object.assign({}, state.entities, toEntities<Policy>(policies))
  };
}

function deletePolicySuccess(state: State, action): State {
  const {[action.payload]: removedEntity, ...entities} = state.entities;
  return Object.assign({}, state, {entities});
}

function suspendPolicySuccess(state: State, action): State {
  return updateEntityField(state, action, 'status', 'SUSPENDED');
}

function resumePolicySuccess(state: State, action): State {
  return updateEntityField(state, action, 'status', 'RUNNING');
}

function updateEntityField(state: State, action, fieldName: string, newValue): State {
  const id = action.payload;
  const updatedEntity = {...state.entities[id], [fieldName]: newValue};
  const newEntities = Object.assign({}, state.entities, {[id]: updatedEntity});
  return Object.assign({}, state, {entities: newEntities});
}
