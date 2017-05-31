import { JobService } from './job.service';
import { HttpService } from './http.service';
import {
  BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions,
  ResponseOptions
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ReflectiveInjector } from '@angular/core';
import { Job } from 'models/job.model';
import { Policy } from '../models/policy.model';

function getMockResponse(body) {
  return new Response(new ResponseOptions({
    body: JSON.stringify(body),
  }));
}


describe('JobService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http,
      HttpService,
      JobService
    ]);

    this.jobService = this.injector.get(JobService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => {
      this.lastConnection = connection;
    });
  });

  describe('#getJobs', () => {
    beforeEach(() => {
      this.jobService.getJobs();
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

  describe('#getJob', () => {
    beforeEach(() => {
      this.id = '1';
      this.jobService.getJob(this.id);
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

  describe('#getJobsForClusters', () => {
    beforeEach(() => {
      this.connections = [];
      this.responseJobs = [<Job>{id: 'j1'}, <Job>{id: 'j2'}];
      this.backend.connections.subscribe((connection: any) => {
        const mockResponse = this.responseJobs[this.connections.length];
        connection.mockRespond(getMockResponse({jobs: [mockResponse]}));
        this.connections.push(connection);
      });
      this.clusterIds = [1, 2];
      this.result = this.jobService.getJobsForClusters(this.clusterIds);
    });

    it('should do 2 requests', () => {
      expect(this.connections.length).toBe(2);
    });

    it('each request should be GET', () => {
      expect(this.connections[0].request.method).toBe(RequestMethod.Get);
      expect(this.connections[1].request.method).toBe(RequestMethod.Get);
    });

    it('each request should use valid URL', () => {
      expect(this.connections[0].request.url).toContain('clusters/1/jobs?numResults=1000');
      expect(this.connections[1].request.url).toContain('clusters/2/jobs?numResults=1000');
    });

    it('should return loaded jobs', () => {
      this.result.map(r => expect(r).toEqual({jobs: this.responseJobs}));
    });
  });

  describe('#getJobsForPolicy', () => {
    beforeEach(() => {
      this.policy = <Policy>{name: 'policyId1', targetClusterResource: {id: 1}};
      this.jobService.getJobsForPolicy(this.policy);
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
    it('should use valid URL', () => {
      expect(this.lastConnection.request.url).toContain('clusters/1/policy/policyId1/jobs?numResults=1000');
    });
  });

});
