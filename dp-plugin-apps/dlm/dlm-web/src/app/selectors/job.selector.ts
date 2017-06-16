import { createSelector } from 'reselect';
import { getJobs } from './root.selector';
import { mapToList } from '../utils/store-util';
import { sortByDateField } from 'utils/array-util';

export const getEntities = createSelector(getJobs, state => state.entities);
export const getAllJobs = createSelector(getEntities, jobs => sortByDateField(mapToList(jobs), 'startTime'));
