/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';

import { Job } from 'models/job.model';
import { Policy } from 'models/policy.model';
import { configureServiceTest } from 'testing/configure';
import { API_PREFIX } from 'constants/api.constant';
import { JobService } from './job.service';

describe('JobService', () => {
  let injector: TestBed;
  let jobService: JobService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    configureServiceTest({
      providers: [
        JobService
      ]
    });

    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    jobService = injector.get(JobService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('#getJobs', () => {
    beforeEach(() => {
      jobService.getJobs().subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}jobs`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#getJob', () => {
    beforeEach(() => {
      this.id = '1';
      jobService.getJob(this.id).subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}jobs/1`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#getJobsForClusters', () => {
    const makeJobResponse = (id: string): Job => ({
      id: id,
      trackingInfo: {},
      duration: -1,
      isCompleted: true
    } as Job);
    const jobsResponse = [makeJobResponse('1'), makeJobResponse('2')] as Job[];
    const clusterIds = ['1', '2'];

    it('should do 2 requests', () => {
      jobService.getJobsForClusters(clusterIds).subscribe();
      const r1 = httpMock.expectOne(`${API_PREFIX}clusters/1/jobs?numResults=1000`);
      const r2 = httpMock.expectOne(`${API_PREFIX}clusters/2/jobs?numResults=1000`);
      expect(r1.request.method).toBe('GET');
      expect(r2.request.method).toBe('GET');
    });

    it('should return loaded jobs', () => {
      jobService.getJobsForClusters(clusterIds).subscribe(response => {
        expect(response).toEqual({jobs: jobsResponse});
      });
      const r1 = httpMock.expectOne(`${API_PREFIX}clusters/1/jobs?numResults=1000`);
      const r2 = httpMock.expectOne(`${API_PREFIX}clusters/2/jobs?numResults=1000`);
      r1.flush({jobs: [{id: '1'}]});
      r2.flush({jobs: [{id: '2'}]});
    });
  });

  describe('#getJobsForPolicy', () => {
    const policy = { name: 'policyId1', clusterResourceForRequests: { id: 1 } } as Policy;
    beforeEach(() => {
      jobService.getJobsForPolicy(policy).subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/policy/policyId1/jobs?numResults=1000`);
      expect(req.request.method).toBe('GET');
    });
  });

});
