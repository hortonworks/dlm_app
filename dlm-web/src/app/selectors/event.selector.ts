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
export const getEventsWithIssues = createSelector(getAllDisplayedEvents, events => events
  .filter(event => event.severity !== EVENT_SEVERITY.INFO));
