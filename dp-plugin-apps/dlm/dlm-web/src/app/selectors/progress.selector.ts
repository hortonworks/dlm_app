import { createSelector } from 'reselect';
import { ProgressState } from 'models/progress-state.model';
import { getProgresses } from './root.selector';

export const getEntities = createSelector(getProgresses, (state) => state.entities);
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
