/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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

