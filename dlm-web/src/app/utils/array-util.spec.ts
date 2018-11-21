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

import * as ArrayUtil from './array-util';
import { sortByDateField } from './array-util';

describe('ArrayUtil', () => {
  let collection, a1, groupedByA, groupedByB;

  describe('#filterCollection', () => {

    beforeEach(() => {
      collection = [
        {a: 1, b: 1},
        {a: 1, b: 2},
        {a: 2, b: 1},
        {a: 2, b: 2}
      ];
      a1 = [
        {a: 1, b: 1},
        {a: 1, b: 2}
      ];
    });

    it('should filter collection (one filter)', () => {
      const filters = {
        a: 1
      };
      const result = ArrayUtil.filterCollection(collection, filters);
      expect(result).toEqual(a1);
    });

    it('should filter collection (multiple filter with two items)', () => {
      const filters = {
        a: 1,
        b: [1, 2]
      };
      const result = ArrayUtil.filterCollection(collection, filters);
      expect(result).toEqual(a1);
    });

    it('should filter collection (multiple filter with one item)', () => {
      const filters = {
        a: 1,
        b: [2]
      };
      const expectedResult = [
        {a: 1, b: 2}
      ];
      const result = ArrayUtil.filterCollection(collection, filters);
      expect(result).toEqual(expectedResult);
    });

    it('empty single filter should be ignored', () => {
      const filters = {
        a: '',
        b: [1, 2]
      };
      const result = ArrayUtil.filterCollection(collection, filters);
      expect(result).toEqual(collection);
    });

    it('empty multiple filter should be ignored', () => {
      const filters = {
        a: 1,
        b: []
      };
      const result = ArrayUtil.filterCollection(collection, filters);
      expect(result).toEqual(a1);
    });

  });

  describe('#groupByKey', () => {

    beforeEach(() => {
      collection = [
        {a: '1', b: '3'},
        {a: '2', b: '2'},
        {a: '1', b: '1'}
      ];
      groupedByA = {
        '1': [{a: '1', b: '3'}, {a: '1', b: '1'}],
        '2': [{a: '2', b: '2'}]
      };
      groupedByB = {
        '1': [{a: '1', b: '1'}],
        '2': [{a: '2', b: '2'}],
        '3': [{a: '1', b: '3'}]
      };
    });

    it('should group by `a`', () => {
      const result = ArrayUtil.groupByKey(collection, 'a');
      expect(result).toEqual(groupedByA);
    });

    it('should group by `b`', () => {
      const result = ArrayUtil.groupByKey(collection, 'b');
      expect(result).toEqual(groupedByB);
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
