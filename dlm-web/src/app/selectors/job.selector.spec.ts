/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
