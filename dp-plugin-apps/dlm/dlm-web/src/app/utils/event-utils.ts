import { Event } from 'models/event.model';
import { JOB_EVENT, POLICY_EVENT } from 'constants/event.constant';
import { EntityType, LOG_EVENT_TYPE_MAP } from 'constants/log.constant';
import { contains } from 'utils/array-util';

export const getEventPolicyName = (id: string): string => {
  // Extract policy name from the policy id in the format
  // "policyId": "/beaconsource/beaconsource/beacontarget/beacontarget/hdfsdr/0/1494924228843/000000002"
  const splits = id.split('/');
  return splits.length >= 6 ? splits[5] : '';
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
