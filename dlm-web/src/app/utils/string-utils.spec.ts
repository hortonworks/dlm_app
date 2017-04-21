import * as StringUtils from './string-utils';

describe('StringUtils', () => {

  describe('#capitalize', () => {

    it('should make first letter upper', () => {
      expect(StringUtils.capitalize('abc')).toBe('Abc');
    });

    it('should leave capitalized string as is', () => {
      expect(StringUtils.capitalize('Abc')).toBe('Abc');
    });

    it('should leave empty string as is', () => {
      expect(StringUtils.capitalize('')).toBe('');
    });

  });

});
