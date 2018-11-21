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

import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Job } from 'models/job.model';
import { Policy } from 'models/policy.model';
import { API_PREFIX } from 'constants/api.constant';
import { JobService } from './job.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from 'interceptors/api.interceptor';

describe('JobService', () => {
  let injector: TestBed;
  let jobService: JobService;
  let httpMock: HttpTestingController;
  let id: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        JobService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true
        }
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
      id = '1';
      jobService.getJob(id).subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}jobs/1`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#getJobsForClusters', () => {
    const makeJobResponse = (jobId: string): Job => ({
      id: jobId,
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
