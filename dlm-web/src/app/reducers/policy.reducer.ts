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

import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
import { Policy, PolicyUpdatePayload } from 'models/policy.model';
import { Job } from 'models/job.model';
import * as fromPolicy from 'actions/policy.action';
import { sortByDateField, uniqBy, contains } from 'utils/array-util';
import { ActionWithPayload } from 'actions/actions.type';

export interface State extends EntityState<Policy> {}

export const policyAdapter: EntityAdapter<Policy> = createEntityAdapter<Policy>();

export const initialState: State = policyAdapter.getInitialState({
  entities: {}
});

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromPolicy.ActionTypes.LOAD_POLICIES.SUCCESS:
      return loadPoliciesSuccess(state, action);

    case fromPolicy.ActionTypes.UPDATE_POLICY.SUCCESS:
      return updatePolicy(state, action);

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
  return policyAdapter.addAll(policies, state);
}

function deletePolicySuccess(state: State, action): State {
  return policyAdapter.removeOne(action.payload.response, state);
}

function suspendPolicySuccess(state: State, action): State {
  return updateEntityField(state, action, 'status', 'SUSPENDED');
}

function resumePolicySuccess(state: State, action): State {
  return updateEntityField(state, action, 'status', 'RUNNING');
}

function updateEntityField(state: State, action, fieldName: string, newValue): State {
  const id = action.payload.response;
  return policyAdapter.updateOne({id: id, changes: {[fieldName]: newValue}}, state);
}

function loadLastJobsSuccess(state: State, action): State {
  const { jobs } = action.payload.response;
  const updatedPolicies: Update<Policy>[] = jobs.reduce((policyEntities: Update<Policy>[], job: Job) => {
    if (job.policyId in state.entities) {
      const policy = state.entities[job.policyId];
      const lastJobs = uniqBy(sortByDateField((policyEntities[job.policyId] && policyEntities[job.policyId].jobs || []).concat(job),
        'startTime'), 'id');
      return policyEntities.concat({id: policy.id, changes: { jobs: lastJobs}});
    }
    return policyEntities;
  }, []);

  return policyAdapter.updateMany(updatedPolicies, state);
}

function updatePolicy(state: State, action: ActionWithPayload<{response: { policy: Policy, updatePayload: PolicyUpdatePayload}}>): State {
  const { policy, updatePayload } = action.payload.response;
  const nonCustomProperties = ['description', 'startTime', 'endTime', 'frequencyInSec'];
  const updatedEntity: Policy = Object.keys(updatePayload).reduce((acc, key) => {
    if (contains(nonCustomProperties, key)) {
      const propName = key === 'frequencyInSec' ? 'frequency' : key;
      return {
        ...acc,
        [propName]: updatePayload[key]
      };
    }
    return {
      ...acc,
      customProperties: {
        ...acc.customProperties,
        [key]: updatePayload[key]
      }
    };
  }, state.entities[policy.id]);

  return policyAdapter.updateOne({ id: policy.id, changes: updatedEntity }, state);
}
