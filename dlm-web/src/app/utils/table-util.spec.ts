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

import * as tableUtil from './table-util';
import { JobTrackingInfo } from 'models/job-tracking-info.model';

describe('Table Util', () => {
  describe('#transferredBytesComparator', () => {
    it('should return correct value', () => {
      const tests = [
        {a: {} as JobTrackingInfo, b: {} as JobTrackingInfo, expected: 0},
        {
          a: {progress: {bytesCopied: 10}} as JobTrackingInfo,
          b: {} as JobTrackingInfo,
          expected: 10
        },
        {
          a: {progress: {bytesCopied: 10}} as JobTrackingInfo,
          b: {progress: {bytesCopied: 10}} as JobTrackingInfo,
          expected: 0
        },
        {
          a: {progress: {bytesCopied: 10}} as JobTrackingInfo,
          b: {progress: {bytesCopied: 20}} as JobTrackingInfo,
          expected: -10
        }
      ];
      tests.forEach(t => {
        expect(tableUtil.transferredBytesComparator(t.a, t.b)).toBe(t.expected, `${t.a} vs ${t.b} is ${t.expected}`);
      });
    });
  });

  describe('#timestampComparator', () => {
    it('should return correct value', () => {
      const tests = [
        {a: '10', b: '10', expected: 0},
        {a: '2/13/2018, 0:00:43 AM', b: '2/13/2018, 0:00:43 AM', expected: 0},
        {a: '2/13/2018, 0:00:43 AM', b: '2/13/2018, 0:01:43 AM', expected: -60000},
        {a: '2/13/2018, 0:10:43 AM', b: '2/13/2018, 0:00:43 AM', expected: 600000},
      ];
      tests.forEach(t => {
        expect(tableUtil.timestampComparator(t.a, t.b)).toBe(t.expected, `${t.a} vs ${t.b} is ${t.expected}`);
      });
    });
  });
});

