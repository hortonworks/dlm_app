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

import * as ObjectUtils from './object-utils';

describe('ObjectUtils', () => {
  let obj;

  describe('#toKeyValueArray', () => {

    beforeEach(() => {
      obj = {
        a: '1',
        b: 'b',
        c: [1, 2]
      };
    });

    it('should convert object to the key-value array', () => {
      const expectedResult = [
        {key: 'a', value: '1'},
        {key: 'b', value: 'b'},
        {key: 'c', value: 1},
        {key: 'c', value: 2}
      ];
      const result = ObjectUtils.toKeyValueArray(obj);
      expect(result).toEqual(expectedResult);
    });

  });

  describe('#omit', () => {
    it('should return object without specified keys', () => {
      obj = {
        a: 2,
        b: 3,
        c: 4
      };
      expect(ObjectUtils.omit(obj, 'a', 'b')).toEqual({ c: 4 });
    });

    it('should return object itself when keys not found', () => {
      obj = {
        a: 2
      };
      expect(ObjectUtils.omit(obj, 'b')).toEqual({ a: 2 });
    });
  });

  describe('#omitEmpty', () => {
    it('should skip key value with null or undefined values', () => {
      obj = {
        a: null,
        b: undefined,
        c: false,
        d: 1,
        e: 's'
      };
      expect(ObjectUtils.omitEmpty(obj)).toEqual({
        c: false,
        d: 1,
        e: 's'
      });
    });
  });

  describe('#multiLevelResolve', () => {
    it('should return undefined if path is not exist', () => {
      expect(ObjectUtils.multiLevelResolve({}, 'a.b')).toBeUndefined();
    });

    it('should return value under path', () => {
      obj = {
        a: 1,
        b: {
          c: 2
        },
        d: { e: { f: { g: 3 } } }
      };
      const tests = [
        {path: 'a', expected: 1},
        {path: 'b.c', expected: 2},
        {path: 'd.e.f.g', expected: 3}
      ];
      tests.forEach((t) => {
        expect(ObjectUtils.multiLevelResolve(obj, t.path)).toBe(t.expected, `value by ${t.path}`);
      });
    });
  });
});
