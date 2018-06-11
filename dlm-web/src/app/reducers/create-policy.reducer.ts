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

import { Step } from 'models/wizard.model';
import { BaseState } from 'models/base-resource-state';
import * as fromPolicy from 'actions/policy.action';
import { toEntities, mapToList } from 'utils/store-util';
import { WIZARD_STEP_ID, WIZARD_STEP_LABELS, WIZARD_STATE } from 'constants/policy.constant';
import { HttpProgress } from '../models/cloud-account.model';
import { PROGRESS_STATUS } from 'constants/status.constant';

export type State = BaseState<Step>;

const initialSteps: Step[] = Object.keys(WIZARD_STEP_ID).map((key, i) => {
  const state = (i === 0) ? WIZARD_STATE.ACTIVE : WIZARD_STATE.DISABLED;
  const id = WIZARD_STEP_ID[key];
  const keys = Object.keys(WIZARD_STEP_ID);
  const nextStepId = i < keys.length - 1 ? WIZARD_STEP_ID[keys[i + 1]] : null;
  const previousStepId = i === 0 ? null : WIZARD_STEP_ID[keys[i - 1]];
  return <Step>{
    id,
    label: WIZARD_STEP_LABELS[id],
    state,
    value: {},
    index: i + 1,
    nextStepId,
    previousStepId
  };
});

export const initialState: State = {
  entities: toEntities<Step>(initialSteps),
  validation: <HttpProgress>{}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromPolicy.ActionTypes.WIZARD_SAVE_STEP:
      return wizardSaveStep(state, action);
    case fromPolicy.ActionTypes.WIZARD_MOVE_TO_STEP:
      return wizardMoveToStep(state, action);
    case fromPolicy.ActionTypes.WIZARD_RESET_ALL_STEPS:
      return wizardResetAllSteps(state, action);
    case fromPolicy.ActionTypes.WIZARD_RESET_STEP:
      return wizardResetStep(state, action);
    case fromPolicy.ActionTypes.VALIDATE_POLICY.FAILURE:
      return validationFailure(state, action);
    case fromPolicy.ActionTypes.VALIDATE_POLICY.SUCCESS:
      return validationSuccess(state, action);
    default:
      return state;
  }
}

function validationSuccess(state: State, action): State {
  return <State>{
    ...state,
    validation: {
      state: PROGRESS_STATUS.SUCCESS,
      response: action.payload.response
    }
  };
}

function validationFailure(state: State, action): State {
  return <State>{
    ...state,
    validation: {
      state: PROGRESS_STATUS.FAILED,
      response: action.payload
    }
  };
}

function wizardSaveStep(state: State, action): State {
  const {stepId, value} = action.payload;
  const updatedState = state.entities[stepId].nextStepId !== null ? WIZARD_STATE.COMPLETED : WIZARD_STATE.ACTIVE;
  const updatedEntity = {...state.entities[stepId], value, state: updatedState};
  const newEntities = Object.assign({}, state.entities, {[stepId]: updatedEntity});
  // Update state of next step
  const nextStepId = newEntities[stepId].nextStepId;
  if (nextStepId !== null) {
    const updatedNextStep = {...newEntities[nextStepId], state: WIZARD_STATE.ACTIVE};
    const updatedEntities = Object.assign({}, newEntities, {[nextStepId]: updatedNextStep});
    return Object.assign({}, state, {entities: updatedEntities});
  }
  return Object.assign({}, state, {entities: newEntities});
}

function wizardMoveToStep(state: State, action): State {
  const {stepId} = action.payload;
  const steps = mapToList(state.entities);
  // Disable all the steps that come after the moveToStep
  const updatedState = steps.map(step => {
    let stepState = WIZARD_STATE.DISABLED;
    if (step.id === stepId) {
      stepState = WIZARD_STATE.ACTIVE;
    } else if ( state.entities[stepId].index > step.index) {
      stepState = WIZARD_STATE.COMPLETED;
    }
    return {...step, state: stepState};
  });
  return Object.assign({}, state, {entities:  toEntities(updatedState)});
}

function wizardResetAllSteps(state: State, action): State {
  return Object.assign({}, state, initialState);
}

function wizardResetStep(state: State, action): State {
  const {stepId} = action.payload;
  const updatedEntity = {...state.entities[stepId], value: {}, state: WIZARD_STATE.DISABLED};
  const newEntities = Object.assign({}, state.entities, {[stepId]: updatedEntity});
  return Object.assign({}, state, {entities: newEntities});
}
