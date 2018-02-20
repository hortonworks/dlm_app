/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as ObjectUtils from './object-utils';

describe('ObjectUtils', () => {

  describe('#toKeyValueArray', () => {

    beforeEach(() => {
      this.obj = {
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
      const result = ObjectUtils.toKeyValueArray(this.obj);
      expect(result).toEqual(expectedResult);
    });

  });

  describe('#omit', () => {
    it('should return object without specified keys', () => {
      const obj = {
        a: 2,
        b: 3,
        c: 4
      };
      expect(ObjectUtils.omit(obj, 'a', 'b')).toEqual({ c: 4 });
    });

    it('should return object itself when keys not found', () => {
      const obj = {
        a: 2
      };
      expect(ObjectUtils.omit(obj, 'b')).toEqual({ a: 2 });
    });
  });

  describe('#omitEmpty', () => {
    it('should skip key value with null or undefined values', () => {
      const obj = {
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
      const obj = {
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
