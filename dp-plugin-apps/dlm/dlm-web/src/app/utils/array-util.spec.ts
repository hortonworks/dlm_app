/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as ArrayUtil from './array-util';
import { sortByDateField } from './array-util';

describe('ArrayUtil', () => {

  describe('#filterCollection', () => {

    beforeEach(() => {
      this.collection = [
        {a: 1, b: 1},
        {a: 1, b: 2},
        {a: 2, b: 1},
        {a: 2, b: 2}
      ];
      this.a1 = [
        {a: 1, b: 1},
        {a: 1, b: 2}
      ];
    });

    it('should filter collection (one filter)', () => {
      const filters = {
        a: 1
      };
      const result = ArrayUtil.filterCollection(this.collection, filters);
      expect(result).toEqual(this.a1);
    });

    it('should filter collection (multiple filter with two items)', () => {
      const filters = {
        a: 1,
        b: [1, 2]
      };
      const result = ArrayUtil.filterCollection(this.collection, filters);
      expect(result).toEqual(this.a1);
    });

    it('should filter collection (multiple filter with one item)', () => {
      const filters = {
        a: 1,
        b: [2]
      };
      const expectedResult = [
        {a: 1, b: 2}
      ];
      const result = ArrayUtil.filterCollection(this.collection, filters);
      expect(result).toEqual(expectedResult);
    });

    it('empty single filter should be ignored', () => {
      const filters = {
        a: '',
        b: [1, 2]
      };
      const result = ArrayUtil.filterCollection(this.collection, filters);
      expect(result).toEqual(this.collection);
    });

    it('empty multiple filter should be ignored', () => {
      const filters = {
        a: 1,
        b: []
      };
      const result = ArrayUtil.filterCollection(this.collection, filters);
      expect(result).toEqual(this.a1);
    });

  });

  describe('#groupByKey', () => {

    beforeEach(() => {
      this.collection = [
        {a: '1', b: '3'},
        {a: '2', b: '2'},
        {a: '1', b: '1'}
      ];
      this.groupedByA = {
        '1': [{a: '1', b: '3'}, {a: '1', b: '1'}],
        '2': [{a: '2', b: '2'}]
      };
      this.groupedByB = {
        '1': [{a: '1', b: '1'}],
        '2': [{a: '2', b: '2'}],
        '3': [{a: '1', b: '3'}]
      };
    });

    it('should group by `a`', () => {
      const result = ArrayUtil.groupByKey(this.collection, 'a');
      expect(result).toEqual(this.groupedByA);
    });

    it('should group by `b`', () => {
      const result = ArrayUtil.groupByKey(this.collection, 'b');
      expect(result).toEqual(this.groupedByB);
    });

  });

  describe('#sortByDateField', () => {

    it('should sort collection by selected field comparing values as dates', () => {
      const data = [
        {f: '2015-06-12T03:32:00'},
        {f: '2017-06-12T03:32:00'},
        {f: '2016-06-12T03:32:00'}
      ];
      const expected = [
        {f: '2017-06-12T03:32:00'},
        {f: '2016-06-12T03:32:00'},
        {f: '2015-06-12T03:32:00'}
      ];
      expect(sortByDateField(data, 'f')).toEqual(expected);
    });

  });

});
