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
