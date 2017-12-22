/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed, getTestBed } from '@angular/core/testing';

import { configureServiceTest } from 'testing/configure';
import { API_PREFIX } from 'constants/api.constant';
import { EventService } from './event.service';

describe('EventService', () => {
  let injector: TestBed;
  let eventService: EventService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    configureServiceTest({
      providers: [
        EventService
      ]
    });

    injector = getTestBed();
    eventService = injector.get(EventService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('#getEvents', () => {
    beforeEach(() => {
      eventService.getEvents().subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}events`);
      expect(req.request.method).toBe('GET');
    });
  });
});
