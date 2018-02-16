/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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

    it('should process uppercase string', () => {
      expect(StringUtils.capitalize('ABC')).toBe('Abc');
    });

  });

  describe('#simpleSearch', () => {
    it('should (not) find string by substring', () => {
      const str = 'some Mixed str1ng!';
      const tests = [
        {search: 'any', expected: false},
        {search: 'some', expected: true},
        {search: '!', expected: true},
        {search: '1', expected: true},
        {search: 'str1ng!\$', expected: true}
      ];
      tests.forEach(t => {
        expect(StringUtils.simpleSearch(str, t.search)).toBe(t.expected, `find by ${t.search}`);
      });
    });
  });

});
