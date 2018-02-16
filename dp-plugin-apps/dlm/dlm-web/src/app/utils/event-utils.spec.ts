/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Event } from 'models/event.model';
import * as eventUtils from './event-utils';

describe('Event Utils', () => {
  describe('#getEventPolicyName', () => {
    it('should return empty string by default', () => {
      expect(eventUtils.getEventPolicyName(null)).toBe('');
    });

    it('should return empty string if policy name cannot be parsed', () => {
      const id = '/beaconsource/beaconsource/beacontarget/beacontarget';
      expect(eventUtils.getEventPolicyName(id)).toBe('');
    });

    it('should return policy name from valid id', () => {
      const id = '/beaconsource/beaconsource/beacontarget/beacontarget/hdfsdr/0/1494924228843/000000002';
      expect(eventUtils.getEventPolicyName(id)).toBe('hdfsdr');
    });
  });

  describe('#getEventEntityName', () => {
    it('should return empty string by default', () => {
      expect(eventUtils.getEventEntityName({} as Event)).toBe('');
    });

    it('should return policy name based on policyId attribute if event related to policy', () => {
      const event = {
        eventType: 'policy',
        policyId: '/s/s/t/t/policyIdValue'
      } as Event;
      expect(eventUtils.getEventEntityName(event)).toBe('policyIdValue');
    });

    it('should return policy name based on instanceId attribute if event related to job', () => {
      const event = {
        eventType: 'policy',
        instanceId: '/s/s/t/t/policyIdValue'
      } as Event;
      expect(eventUtils.getEventEntityName(event)).toBe('policyIdValue');
    });

    it('should return event type when event is not related to policy or job', () => {
      const event = {
        eventType: 'system'
      } as Event;
      expect(eventUtils.getEventEntityName(event)).toBe('system');
    });
  });
});
