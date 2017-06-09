import { PolicyStatusFmtPipe } from './policy-status-fmt.pipe';
import { async, TestBed } from '@angular/core/testing';

describe('PolicyStatusFmtPipe', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyStatusFmtPipe]
    });
    this.pipe = new PolicyStatusFmtPipe();
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
