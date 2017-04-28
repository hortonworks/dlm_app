import {PolicyService} from './policy.service';
import {HttpService} from './http.service';
import {BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {ReflectiveInjector} from '@angular/core';
import {Policy} from '../models/policy.model';

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
      this.policy = <Policy>{id: '1'};
      this.policyService.createPolicy(this.policy);
    });
    it('should do POST request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Post);
    });
  });

  describe('#removePolicy', () => {
    beforeEach(() => {
      this.id = '1';
      this.policyService.removePolicy(this.id);
    });
    it('should do DELETE request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Delete);
    });
  });

});
