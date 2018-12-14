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

import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { Policy, PolicyPayload } from 'models/policy.model';
import { JobService } from 'services/job.service';
import { API_PREFIX } from 'constants/api.constant';
import { PolicyService } from './policy.service';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from 'interceptors/api.interceptor';
import { jobStub } from 'testing/mock-services';

describe('PolicyService', () => {
  let injector: TestBed;
  let policyService: PolicyService;
  let httpMock: HttpTestingController;
  let policy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        PolicyService,
        {provide: JobService, useValue: jobStub},
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true
        }
      ]
    });
    injector = getTestBed();
    policyService = injector.get(PolicyService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('#fetchPolicies', () => {
    beforeEach(() => {
      policyService.fetchPolicies().subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}policies`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#fetchPolicy', () => {
    beforeEach(() => {
      policyService.fetchPolicy('1').subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}policies/1`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#createPolicy', () => {
    beforeEach(() => {
      policy = <PolicyPayload>{
        policyDefinition: { name: 'policyName' }
      };
      policyService.createPolicy({
        policy: policy,
        targetClusterId: 'clusterId'
      }).subscribe();
    });
    it('should do POST request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/clusterId/policy/policyName/submit`);
      expect(req.request.method).toBe('POST');
    });
  });

  describe('#deletePolicy', () => {
    beforeEach(() => {
      policy = <Policy>{name: 'n1', clusterResourceForRequests: {id: 1}};
      policyService.deletePolicy(policy).subscribe();
    });
    it('should do DELETE request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/policy/n1`);
      expect(req.request.method).toBe('DELETE');
    });
  });

  describe('#suspendPolicy', () => {
    beforeEach(() => {
      policy = <Policy>{name: 'n1', clusterResourceForRequests: {id: 1}};
      policyService.suspendPolicy(policy).subscribe();
    });
    it('should do PUT request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/policy/n1/suspend`);
      expect(req.request.method).toBe('PUT');
    });
  });

  describe('#resumePolicy', () => {
    beforeEach(() => {
      policy = <Policy>{name: 'n1', clusterResourceForRequests: {id: 1}};
      policyService.resumePolicy(policy).subscribe();
    });
    it('should do PUT request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/policy/n1/resume`);
      expect(req.request.method).toBe('PUT');
    });
  });
});
