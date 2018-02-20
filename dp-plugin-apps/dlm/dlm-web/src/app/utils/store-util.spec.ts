/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as storeUtil from './store-util';

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
