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

import * as sizeUtil from './size-util';

describe('Size Util', () => {
  describe('#sizeToBites', () => {
    it('should return Number if input matched to numbers only', () => {
      expect(sizeUtil.sizeToBites('1000', 0)).toBe(1000);
    });

    it('should return default value if input does not contain numbers', () => {
      expect(sizeUtil.sizeToBites('m', 0)).toBe(0);
    });

    it('should return correct number of bytes', () => {
      const tests = [
        { size: '2 b',    expected: 2 },
        { size: '2.4 mb', expected: 2.4 * Math.pow(1024, 2) },
        { size: '1.5 kb', expected:  1.5 * 1024 },
        { size: '2.5 gb', expected:  2.5 * Math.pow(1024, 3) },
        { size: '3.5 tb', expected:  3.5 * Math.pow(1024, 4) },
      ];
      tests.forEach(t => {
        expect(sizeUtil.sizeToBites(t.size, 0)).toBe(Math.floor(t.expected), `${t.size} is ${t.expected} bytes`);
      });
    });
  });

  describe('#bytesToSize', () => {
    it('should return html string with minus icon if input is not a number', () => {
      const icon = '<i class="fa fa-minus"></i>';
      expect(sizeUtil.bytesToSize(NaN, 2)).toBe(icon, 'NaN');
      expect(sizeUtil.bytesToSize(Infinity, 2)).toBe(icon, 'Infinity');
    });

    it('should return correct size string with specified precision', () => {
      const makeStr = (size, unit, precision = 2) => `${size.toFixed(precision)} <span class="unit">${unit}</span>`;
      const tests = [
        { expected: makeStr(2, 'bytes', 0),    bytes: 2, precision: 0 },
        { expected: makeStr(2.4, 'MB', 1), bytes: 2.4 * Math.pow(1024, 2), precision: 1 },
        { expected: makeStr(1.5, 'KB', 3), bytes:  1.5 * 1024, precision: 3 },
        { expected: makeStr(2.5, 'GB'), bytes:  2.5 * Math.pow(1024, 3), precision: undefined },
        { expected: makeStr(3.5, 'TB'), bytes:  3.5 * Math.pow(1024, 4), precision: undefined },
      ];
      tests.forEach(t => {
        expect(sizeUtil.bytesToSize(t.bytes, t.precision)).toBe(t.expected);
      });
    });
  });
});
