/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';

import { configureServiceTest } from 'testing/configure';
import { Policy, PolicyPayload } from 'models/policy.model';
import { JobService } from 'services/job.service';
import { API_PREFIX } from 'constants/api.constant';
import { PolicyService } from './policy.service';

describe('PolicyService', () => {
  let injector: TestBed;
  let policyService: PolicyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    configureServiceTest({
      providers: [
        { provide: TranslateService, useValue: jasmine.createSpyObj('t', ['instant']) },
        PolicyService,
        JobService
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
      this.policy = <PolicyPayload>{
        policyDefinition: { name: 'policyName' }
      };
      policyService.createPolicy({
        policy: this.policy,
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
      this.policy = <Policy>{name: 'n1', targetClusterResource: {id: 1}};
      policyService.deletePolicy(this.policy).subscribe();
    });
    it('should do DELETE request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/policy/n1`);
      expect(req.request.method).toBe('DELETE');
    });
  });

  describe('#suspendPolicy', () => {
    beforeEach(() => {
      this.policy = <Policy>{name: 'n1', targetClusterResource: {id: 1}};
      policyService.suspendPolicy(this.policy).subscribe();
    });
    it('should do PUT request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/policy/n1/suspend`);
      expect(req.request.method).toBe('PUT');
    });
  });

  describe('#resumePolicy', () => {
    beforeEach(() => {
      this.policy = <Policy>{name: 'n1', targetClusterResource: {id: 1}};
      policyService.resumePolicy(this.policy).subscribe();
    });
    it('should do PUT request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/policy/n1/resume`);
      expect(req.request.method).toBe('PUT');
    });
  });
});
