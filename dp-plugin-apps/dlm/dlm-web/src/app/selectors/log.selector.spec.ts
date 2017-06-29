import * as logSelectors from './log.selector';
import {State} from 'reducers';
import {Log} from 'models/log.model';
import * as stateUtils from 'testing/state';

describe('Logs Selectors', () => {

  let state: State;
  beforeEach(() => {
    this.log01 = <Log>{requestId: '1', status: 'SUCCEEDED', message: 'event 1'};
    this.log02 = <Log>{requestId: '2', status: 'SUCCEEDED', message: 'event 2'};
    const logsState = {
      logs: {
        entities: {
          '/d1/c1/p1/000': this.log01,
          '/d2/c2/p2/000': this.log02
        }
      }
    };
    state = stateUtils.getInitialState();
    state = stateUtils.changeState(state, logsState);
  });

  describe('#getAllLogs', () => {
    it('should map entities to array sorted by startTime', () => {
      const result = logSelectors.getAllLogs(state);
      expect(result.length).toEqual(2);
      expect(result[0]).toBe(this.log01);
      expect(result[1]).toBe(this.log02);
    });
  });

});
