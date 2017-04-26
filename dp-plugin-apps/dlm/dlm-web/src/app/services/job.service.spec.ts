import { JobService } from './job.service';
import {HttpService} from './http.service';
import {BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {ReflectiveInjector} from '@angular/core';

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
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
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

});
