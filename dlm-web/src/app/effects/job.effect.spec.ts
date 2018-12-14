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

import { TestBed } from '@angular/core/testing';
import { ReplaySubject, of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { JobEffects } from './job.effect';
import { JobService } from '../services/job.service';
import * as jobActions from '../actions/job.action';
import { Job } from '../models/job.model';
import { Policy } from '../models/policy.model';

describe('JobEffects', () => {
  let actions: ReplaySubject<any>;
  let job1, job2, policy, jobs, error;
  const jobServiceStub = jasmine.createSpyObj('jobService', ['getJobs', 'getJobsForClusters', 'getJobsForPolicy']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JobEffects,
        {
          provide: JobService,
          useValue: jobServiceStub
        },
        provideMockActions(() => actions)
      ]
    });

    actions = new ReplaySubject();
  });

  function setup() {
    return {
      jobService: TestBed.get(JobService),
      jobEffects: TestBed.get(JobEffects)
    };
  }

  beforeEach(() => {
    job1 = <Job>{ id: '1' };
    job2 = <Job>{ id: '2' };
    policy = <Policy>{ name: 'n1', targetClusterResource: { id: 1 } };
    jobs = { jobs: [job1, job2] };
    error = new Error('msg');
  });

  describe('#loadJobs$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobs.and.returnValue(of(jobs));
      const expectedResult = jobActions.loadJobsSuccess(jobs, {requestId: 'JOBS'});
      actions.next(jobActions.loadJobs('JOBS'));

      jobEffects.loadJobs$.subscribe(result => {
        expect(result).toEqual(expectedResult);
      });
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobs.and.returnValue(throwError(error));
      const expectedResult = jobActions.loadJobsFail(error, {requestId: 'JOBS'});
      actions.next(jobActions.loadJobs('JOBS'));
      jobEffects.loadJobs$.subscribe(result => {
        expect(result).toEqual(expectedResult);
      });
    });

  });

  describe('#loadJobsForClusters$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForClusters.and.returnValue(of(jobs));
      const expectedResult = jobActions.loadJobsSuccess(jobs, {requestId: 'JOBS_CLUSTER'});
      actions.next(jobActions.loadJobsForClusters([1, 2], 'JOBS_CLUSTER'));

      let result = null;
      jobEffects.loadJobsForClusters$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForClusters.and.returnValue(throwError(error));
      const expectedResult = jobActions.loadJobsFail(error, {requestId: 'JOBS_CLUSTER'});
      actions.next(jobActions.loadJobsForClusters([1, 2], 'JOBS_CLUSTER'));
      let result = null;
      jobEffects.loadJobsForClusters$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

  });

  describe('#loadJobsForPolicy$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForPolicy.and.returnValue(of(jobs));
      const expectedResult = jobActions.loadJobsSuccess(jobs);
      actions.next(jobActions.loadJobsForPolicy(policy));

      let result = null;
      jobEffects.loadJobsForPolicy$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, jobEffects} = setup();
      jobService.getJobsForPolicy.and.returnValue(throwError(error));
      const expectedResult = jobActions.loadJobsFail(error);
      actions.next(jobActions.loadJobsForPolicy(policy));
      let result = null;
      jobEffects.loadJobsForPolicy$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

  });

});
