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
