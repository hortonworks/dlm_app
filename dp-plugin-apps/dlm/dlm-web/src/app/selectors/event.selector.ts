/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getEvents } from './root.selector';
import { getEntities as getPolicies } from './policy.selector';
import { mapToList } from '../utils/store-util';
import { EVENT_SEVERITY } from 'constants/status.constant';
import { sortByDateField } from 'utils/array-util';

const skipSucceed = event => event.severity !== EVENT_SEVERITY.INFO;
const addPolicyFlag = (event, policies) => ({...event, policyExists: !!policies[event.policyId]});
export const getEntities = createSelector(getEvents, state => state.entities);
export const getAllEvents = createSelector(getEntities, mapToList);
export const getAllEventsWithPoliciesFlag = createSelector(getAllEvents, getPolicies, (events, policies) => events
    .filter(event => skipSucceed(event))
    .map(event => addPolicyFlag(event, policies)));
export const getNewEventsCount = createSelector(getEvents, state => state.newEventsCount);
export const getDisplayedEvents = createSelector(getAllEvents, getPolicies, (events, policies) => events
    .map(event => addPolicyFlag(event, policies)));
export const getAllDisplayedEvents = createSelector(getAllEvents, getPolicies, (events, policies) => sortByDateField(events, 'timestamp')
  .map(event => addPolicyFlag(event, policies)));
