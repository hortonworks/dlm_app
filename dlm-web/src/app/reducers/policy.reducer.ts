/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { BaseState } from 'models/base-resource-state';
import * as fromPolicy from 'actions/policy.action';
import { toEntities } from 'utils/store-util';
import { sortByDateField, uniqBy } from 'utils/array-util';

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
  const id = action.payload.response;
  const updatedEntity = {...state.entities[id], [fieldName]: newValue};
  const newEntities = Object.assign({}, state.entities, {[id]: updatedEntity});
  return Object.assign({}, state, {entities: newEntities});
}

function loadLastJobsSuccess(state: State, action): State {
  const { jobs } = action.payload.response;
  const updatedPolicies = jobs.reduce((policyEntities: {[id: string]: Policy}, job: Job) => {
    if (job.policyId in state.entities) {
      const policy = state.entities[job.policyId];
      const lastJobs = uniqBy(sortByDateField((policyEntities[job.policyId] && policyEntities[job.policyId].jobs || []).concat(job),
        'startTime'), 'id');
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
