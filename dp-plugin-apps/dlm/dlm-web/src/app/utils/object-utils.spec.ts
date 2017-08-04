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

});
