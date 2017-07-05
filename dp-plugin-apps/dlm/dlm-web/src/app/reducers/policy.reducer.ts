import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { BaseState } from 'models/base-resource-state';
import * as fromPolicy from 'actions/policy.action';
import { toEntities } from 'utils/store-util';
import { sortByDateField } from 'utils/array-util';

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

    case fromPolicy.ActionTypes.LOAD_LAST_JOBS.SUCCESS:
      return loadLastJobsSuccess(state, action);

    default:
      return state;
  }
}

function loadPoliciesSuccess(state: State, action): State {
  const policies = action.payload.response.policies;
  return {
    entities: toEntities<Policy>(policies)
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

function loadLastJobsSuccess(state: State, action): State {
  const { jobs } = action.payload.response;
  const updatedPolicies = jobs.reduce((policyEntities: {[id: string]: Policy}, job: Job) => {
    if (job.name in state.entities) {
      const policy = state.entities[job.name];
      const lastJobs = sortByDateField((policyEntities[job.name] && policyEntities[job.name].jobs || []).concat(job), 'startTime');
      return {
        ...policyEntities,
        [policy.id]: {
          ...policy,
          jobs: lastJobs
        }
      };
    }
    return policyEntities;
  }, {});
  return {
    entities: {
      ...state.entities,
      ...updatedPolicies
    }
  };
}
