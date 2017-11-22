/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Event } from 'models/event.model';
import { JOB_EVENT, POLICY_EVENT } from 'constants/event.constant';
import { EntityType, LOG_EVENT_TYPE_MAP } from 'constants/log.constant';
import { contains } from 'utils/array-util';
import { parsePolicyId } from 'utils/policy-util';

export const getEventPolicyName = (id: string): string => {
  const parsed = parsePolicyId(id);
  return parsed.policyName || '';
};

export const getEventEntityName = (event: Event): string => {
  const eventType = (event && 'eventType' in event) ? event['eventType'] : '';
  if (contains([JOB_EVENT, POLICY_EVENT], eventType)) {
    if (event[LOG_EVENT_TYPE_MAP[EntityType.policyinstance]]) {
      return getEventPolicyName(event.instanceId);
    } else if (event[LOG_EVENT_TYPE_MAP[EntityType.policy]]) {
      return getEventPolicyName(event.policyId);
    }
  }
  return eventType;
};
