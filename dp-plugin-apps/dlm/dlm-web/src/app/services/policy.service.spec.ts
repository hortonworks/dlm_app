import { PolicyService } from './policy.service';
import { HttpService } from './http.service';
import { BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ReflectiveInjector } from '@angular/core';
import { Policy, PolicyPayload } from '../models/policy.model';

describe('PolicyService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http,
      HttpService,
      PolicyService
    ]);

    this.policyService = this.injector.get(PolicyService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  describe('#fetchPolicies', () => {
    beforeEach(() => {
      this.policyService.fetchPolicies();
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

  describe('#fetchPolicy', () => {
    beforeEach(() => {
      this.id = '1';
      this.policyService.fetchPolicy(this.id);
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

  describe('#createPolicy', () => {
    beforeEach(() => {
      this.policy = <PolicyPayload>{
        policyDefinition: {},
        submitType: 'SUBMIT'
      };
      this.policyService.createPolicy({policy: this.policy, sourceClusterId: 'clusterId'});
    });
    it('should do POST request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Post);
    });
  });

  describe('#deletePolicy', () => {
    beforeEach(() => {
      this.policy = <Policy>{name: 'n1', targetClusterResource: {id: 'c1'}};
      this.policyService.deletePolicy(this.policy);
    });
    it('should do DELETE request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Delete);
    });
    it('should use valid URL', () => {
      expect(this.lastConnection.request.url).toContain('clusters/c1/policy/n1');
    });
  });

  describe('#suspendPolicy', () => {
    beforeEach(() => {
      this.policy = <Policy>{name: 'n1', targetClusterResource: {id: 'c1'}};
      this.policyService.suspendPolicy(this.policy);
    });
    it('should do PUT request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Put);
    });
    it('should use valid URL', () => {
      expect(this.lastConnection.request.url).toContain('clusters/c1/policy/n1/suspend');
    });
  });

  describe('#resumePolicy', () => {
    beforeEach(() => {
      this.policy = <Policy>{name: 'n1', targetClusterResource: {id: 'c1'}};
      this.policyService.resumePolicy(this.policy);
    });
    it('should do PUT request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Put);
    });
    it('should use valid URL', () => {
      expect(this.lastConnection.request.url).toContain('clusters/c1/policy/n1/resume');
    });
  });

});
