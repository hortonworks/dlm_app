/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getJobs } from './root.selector';
import { mapToList } from '../utils/store-util';
import { sortByDateField } from 'utils/array-util';

export const getEntities = createSelector(getJobs, state => state.entities);
export const getAllJobs = createSelector(getEntities, jobs => sortByDateField(mapToList(jobs), 'startTime'));
export const getQueriesInfo = createSelector(getJobs, state => state.queries);
export const getJobsPage = createSelector(getEntities, getQueriesInfo, (jobs, queriesInfo) => {
  return {
    pageSize: queriesInfo.pageSize,
    offset: queriesInfo.offset,
    policyId: queriesInfo.policyId,
    overallRecords: queriesInfo.overallRecords,
    jobs: queriesInfo.lastResultIds.map(id => jobs[id])
  };
});
