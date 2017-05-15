import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {EffectsTestingModule, EffectsRunner} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {JobEffects} from './job.effect';
import {JobService} from '../services/job.service';
import {Observable} from 'rxjs/Observable';
import * as jobActions from '../actions/job.action';
import {Job} from '../models/job.model';

describe('JobEffects', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      EffectsTestingModule
    ],
    providers: [
      JobEffects,
      {
        provide: JobService,
        useValue: jasmine.createSpyObj('jobService', ['getJobs', 'getJobsForClusters'])
      }
    ]
  }));

  function setup() {
    return {
      jobService: TestBed.get(JobService),
      runner: TestBed.get(EffectsRunner),
      jobEffects: TestBed.get(JobEffects)
    };
  }

  beforeEach(() => {
    this.job1 = <Job>{id: '1'};
    this.job2 = <Job>{id: '2'};
    this.jobs = {policies: [this.job1, this.job2]};
    this.error = new Error('msg'); });

  describe('#loadJobs$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, runner, jobEffects} = setup();
      jobService.getJobs.and.returnValue(Observable.of(this.jobs));
      const expectedResult = jobActions.loadJobsSuccess(this.jobs);
      runner.queue(jobActions.loadJobs());

      let result = null;
      jobEffects.loadJobs$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, runner, jobEffects} = setup();
      jobService.getJobs.and.returnValue(Observable.throw(this.error));
      const expectedResult = jobActions.loadJobsFail(this.error);
      runner.queue(jobActions.loadJobs());
      let result = null;
      jobEffects.loadJobs$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

  });

  describe('#loadJobsForClusters$', () => {

    it('should return a new loadJobsSuccess, with the jobs, on success', () => {
      const {jobService, runner, jobEffects} = setup();
      jobService.getJobsForClusters.and.returnValue(Observable.of(this.jobs));
      const expectedResult = jobActions.loadJobsSuccess(this.jobs);
      runner.queue(jobActions.loadJobsForClusters(['1', '2']));

      let result = null;
      jobEffects.loadJobsForClusters$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

    it('should return a loadJobsFail, on fail', () => {
      const {jobService, runner, jobEffects} = setup();
      jobService.getJobsForClusters.and.returnValue(Observable.throw(this.error));
      const expectedResult = jobActions.loadJobsFail(this.error);
      runner.queue(jobActions.loadJobsForClusters(['1', '2']));
      let result = null;
      jobEffects.loadJobsForClusters$.subscribe(_result => result = _result);
      expect(result).toEqual(expectedResult);
    });

  });

});
