/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { StatusFmtPipe } from './status-fmt.pipe';
import { async, TestBed } from '@angular/core/testing';

describe('StatusFmtPipe', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StatusFmtPipe]
    });
    this.pipe = new StatusFmtPipe();
  }));

  describe('#transform', () => {
    [
      {input: 'RUNNING', output: 'Active'},
      {input: 'SUSPENDED', output: 'Suspended'}
    ].forEach(test => {
      it(`${test.input} -> ${test.output}`, () => {
        expect(this.pipe.transform(test.input)).toBe(test.output);
      });
    });
  });

});
