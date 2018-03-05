/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getCreatePolicyWizardState } from './root.selector';
import { mapToList, toEntities } from 'utils/store-util';
import { Step } from 'models/wizard.model';

const sortSteps = (steps: Step[]) => {
  steps.sort( (a, b) => {
    return (a.index < b.index) ? -1 : 1;
  });
  return steps;
};

export const getEntities = createSelector(getCreatePolicyWizardState, state => state.entities);

const getStepsList = createSelector(getEntities, mapToList);

export const getAllSteps = createSelector(getStepsList, sortSteps);

export const getStep = (stepId) => createSelector(getEntities, entities => entities[stepId]);
export const getSteps = (...stepIds) => createSelector(getEntities, entities => stepIds.map(stepId => entities[stepId]));

const stepValue = stepId => entities => entities[stepId] && 'value' in entities[stepId] ? entities[stepId]['value'] : {};

export const getStepValue = (stepId) => createSelector(getEntities, stepValue(stepId));
