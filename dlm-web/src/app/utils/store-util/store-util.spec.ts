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

import * as storeUtil from './index';

// @TODO: split tests according to util
describe('Store Util', () => {
  describe('mapToList', () => {
    it('should return empty list for empty map', () => {
      expect(storeUtil.mapToList({})).toEqual([]);
    });

    it('should make list from the map of entities', () => {
      const { expected, entities } = {
        expected: [
          'v1',
          {v2: 'v3'}
        ],
        entities: {
          e1: 'v1',
          e2: { v2: 'v3'}
        }
      };
      expect(storeUtil.mapToList(entities)).toEqual(expected);
    });
  });

  describe('toEntities', () => {
    it('should return empty map for empty collection', () => {
      expect(storeUtil.toEntities([])).toEqual({});
    });

    it('should make map from list of entities', () => {
      interface Entity {
        id: string;
        value: any;
      }
      const { expected, collection }: {expected: {[id: string]: Entity}, collection: Entity[]} = {
        collection: [
          {id: '1', value: 'v1'},
          {id: '2', value: 'v2'}
        ],
        expected: {
          1: {id: '1', value: 'v1'},
          2: {id: '2', value: 'v2'}
        }
      };
      expect(storeUtil.toEntities<Entity>(collection)).toEqual(expected);
    });

    it('should make map from list of entities by specified key', () => {
      interface Entity {
        notId: string;
        value: any;
      }
      const { expected, collection }: {expected: {[id: string]: Entity}, collection: Entity[]} = {
        collection: [
          {notId: '1', value: 'v1'},
          {notId: '2', value: 'v2'}
        ],
        expected: {
          1: {notId: '1', value: 'v1'},
          2: {notId: '2', value: 'v2'}
        }
      };
      expect(storeUtil.toEntities<Entity>(collection, 'notId')).toEqual(expected);
    });
  });
});
