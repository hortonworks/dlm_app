import { LogService } from './log.service';
import { HttpService } from './http.service';
import { BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ReflectiveInjector } from '@angular/core';
import { Log } from 'models/log.model';

describe('LogService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http,
      HttpService,
      LogService
    ]);

    this.logService = this.injector.get(LogService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  describe('#fetchLogs', () => {
    beforeEach(() => {
      this.logService.getLogs(1, 1);
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });
});
