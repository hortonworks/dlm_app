/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as sizeUtil from './size-util';

describe('Size Util', () => {
  describe('#sizeToBites', () => {
    it('should return Number if input matched to numbers only', () => {
      expect(sizeUtil.sizeToBites('1000', 0)).toBe(1000);
    });

    it('should return default value if input does not contain numbers', () => {
      expect(sizeUtil.sizeToBites('m', 0)).toBe(0);
    });

    it('should return correct number of bytes', () => {
      const tests = [
        { size: '2 b',    expected: 2 },
        { size: '2.4 mb', expected: 2.4 * Math.pow(1024, 2) },
        { size: '1.5 kb', expected:  1.5 * 1024 },
        { size: '2.5 gb', expected:  2.5 * Math.pow(1024, 3) },
        { size: '3.5 tb', expected:  3.5 * Math.pow(1024, 4) },
      ];
      tests.forEach(t => {
        expect(sizeUtil.sizeToBites(t.size, 0)).toBe(Math.floor(t.expected), `${t.size} is ${t.expected} bytes`);
      });
    });
  });

  describe('#bytesToSize', () => {
    it('should return html string with minus icon if input is not a number', () => {
      const icon = '<i class="fa fa-minus"></i>';
      expect(sizeUtil.bytesToSize(NaN, 2)).toBe(icon, 'NaN');
      expect(sizeUtil.bytesToSize(Infinity, 2)).toBe(icon, 'Infinity');
    });

    it('should return correct size string with specified precision', () => {
      const makeStr = (size, unit, precision = 2) => `${size.toFixed(precision)} <span class="unit">${unit}</span>`;
      const tests = [
        { expected: makeStr(2, 'bytes', 0),    bytes: 2, precision: 0 },
        { expected: makeStr(2.4, 'MB', 1), bytes: 2.4 * Math.pow(1024, 2), precision: 1 },
        { expected: makeStr(1.5, 'KB', 3), bytes:  1.5 * 1024, precision: 3 },
        { expected: makeStr(2.5, 'GB'), bytes:  2.5 * Math.pow(1024, 3), precision: undefined },
        { expected: makeStr(3.5, 'TB'), bytes:  3.5 * Math.pow(1024, 4), precision: undefined },
      ];
      tests.forEach(t => {
        expect(sizeUtil.bytesToSize(t.bytes, t.precision)).toBe(t.expected);
      });
    });
  });
});
