/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as jobSelectors from './job.selector';
import {State} from '../reducers';
import {Job} from '../models/job.model';
import * as stateUtils from '../testing/state';

describe('Jobs Selectors', () => {

  let state: State;
  beforeEach(() => {
    this.job1 = <Job>{id: '1', startTime: '2017-06-12T03:32:00'};
    this.job2 = <Job>{id: '2', startTime: '2018-06-12T03:32:00'};
    const jobsState = {
      jobs: {
        entities: {
          '1': this.job1,
          '2': this.job2
        }
      }
    };
    state = stateUtils.getInitialState();
    state = stateUtils.changeState(state, jobsState);
  });

  describe('#getEntities', () => {
    it('should return entities', () => {
      const result = jobSelectors.getEntities(state);
      expect(result).toBe(state.jobs.entities);
    });
  });

  describe('#getAllJobs', () => {
    it('should map entities to array sorted by startTime', () => {
      const result = jobSelectors.getAllJobs(state);
      expect(result.length).toEqual(2);
      expect(result[0]).toBe(this.job2);
      expect(result[1]).toBe(this.job1);
    });
  });

});
