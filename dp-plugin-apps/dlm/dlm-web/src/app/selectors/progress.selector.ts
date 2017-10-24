/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { ProgressState } from 'models/progress-state.model';
import { getProgresses } from './root.selector';
import { mapToList } from 'utils/store-util';

export const getEntities = createSelector(getProgresses, (state) => state.entities);
export const getAllProgressStates = createSelector(getEntities, mapToList);
export const getProgressState = (requestId: string) => createSelector(getEntities, (entities) => entities[requestId]);
export const getMergedProgress = (...requestIds) => createSelector(getEntities, (entities): ProgressState => {
  const resultId = requestIds.join('_');
  const requests: ProgressState[] = requestIds.map(requestId => entities[requestId] || {
    isInProgress: true,
    error: false,
    success: false,
    requestId
  });
  return {
    requestId: resultId,
    isInProgress: requests.some(request => request.isInProgress),
    success: requests.every(request => request.success),
    error: requests.some(request => request.error)
  };
});
