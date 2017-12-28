/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
