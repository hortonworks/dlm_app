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
