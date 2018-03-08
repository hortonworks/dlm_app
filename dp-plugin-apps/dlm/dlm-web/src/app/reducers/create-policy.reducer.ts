/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Step } from 'models/wizard.model';
import { BaseState } from 'models/base-resource-state';
import * as fromPolicy from 'actions/policy.action';
import { toEntities, mapToList } from 'utils/store-util';
import { WIZARD_STEP_ID, WIZARD_STEP_LABELS, WIZARD_STATE } from 'constants/policy.constant';

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
  entities: toEntities<Step>(initialSteps)
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
    default:
      return state;
  }
}

function wizardSaveStep(state: State, action): State {
  const {stepId, value} = action.payload;
  const updatedEntity = {...state.entities[stepId], value, state: WIZARD_STATE.COMPLETED};
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
