import { EventService } from './event.service';
import {HttpService} from './http.service';
import {BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {ReflectiveInjector} from '@angular/core';

describe('EventService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http,
      HttpService,
      EventService
    ]);

    this.eventService = this.injector.get(EventService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  describe('#getEvents', () => {
    beforeEach(() => {
      this.eventService.getEvents();
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

});
