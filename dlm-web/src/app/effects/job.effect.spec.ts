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

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { JobEffects } from './job.effect';
import { JobService } from '../services/job.service';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import * as jobActions from '../actions/job.action';
import { Job } from '../models/job.model';
import { Policy } from '../models/policy.model';

describe('JobEffects', () => {
  let effects: JobEffects;
  let actions: ReplaySubject<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JobEffects,
        {
          provide: JobService,
          useValue: jasmine.createSpyObj('jobService', ['getJobs', 'getJobsForClusters', 'getJobsForPolicy'])
        },
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(JobEffects);
    actions = new ReplaySubject();
  });

  function setup() {
    return {
      jobService: TestBed.get(JobService),
      jobEffects: TestBed.get(JobEffects)
    };
  }

  beforeEach(() => {
    this.job1 = <Job>{ id: '1' };
    this.job2 = <Job>{ id: '2' };
    this.policy = <Policy>{ name: 'n1', targetClusterResource: { id: 1 } };
    this.jobs = { jobs: [this.job1, this.job2] };
    this.error = new Error('msg');
  });

  describe('#loadJobs$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobs.and.returnValue(Observable.of(this.jobs));
      const expectedResult = jobActions.loadJobsSuccess(this.jobs, {requestId: 'JOBS'});
      actions.next(jobActions.loadJobs('JOBS'));

      jobEffects.loadJobs$.subscribe(result => {
        expect(result).toEqual(expectedResult);
      });
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobs.and.returnValue(Observable.throw(this.error));
      const expectedResult = jobActions.loadJobsFail(this.error, {requestId: 'JOBS'});
      actions.next(jobActions.loadJobs('JOBS'));
      jobEffects.loadJobs$.subscribe(result => {
        expect(result).toEqual(expectedResult);
      });
    });

  });

  xdescribe('#loadJobsForClusters$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForClusters.and.returnValue(Observable.of(this.jobs));
      const expectedResult = jobActions.loadJobsSuccess(this.jobs, {requestId: 'JOBS_CLUSTER'});
      actions.next(jobActions.loadJobsForClusters([1, 2], 'JOBS_CLUSTER'));

      let result = null;
      jobEffects.loadJobsForClusters$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForClusters.and.returnValue(Observable.throw(this.error));
      const expectedResult = jobActions.loadJobsFail(this.error, {requestId: 'JOBS_CLUSTER'});
      actions.next(jobActions.loadJobsForClusters([1, 2], 'JOBS_CLUSTER'));
      let result = null;
      jobEffects.loadJobsForClusters$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

  });

  xdescribe('#loadJobsForPolicy$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForPolicy.and.returnValue(Observable.of(this.jobs));
      const expectedResult = jobActions.loadJobsSuccess(this.jobs);
      actions.next(jobActions.loadJobsForPolicy(this.policy));

      let result = null;
      jobEffects.loadJobsForPolicy$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForPolicy.and.returnValue(Observable.throw(this.error));
      const expectedResult = jobActions.loadJobsFail(this.error);
      actions.next(jobActions.loadJobsForPolicy(this.policy));
      let result = null;
      jobEffects.loadJobsForPolicy$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

  });

});
