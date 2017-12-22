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

import { EntityType } from 'constants/log.constant';
import { NotificationService } from 'services/notification.service';
import { configureServiceTest, mergeDefs, testStoreDef } from 'testing/configure';
import { LogService } from './log.service';
import { API_PREFIX } from 'constants/api.constant';

describe('LogService', () => {
  let injector: TestBed;
  let logService: LogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    configureServiceTest(
      mergeDefs({
        providers: [
          {
            provide: NotificationService,
            useValue: jasmine.createSpyObj('notificationService', ['create'])
          },
          LogService
        ]
      }, testStoreDef)
    );

    injector = getTestBed();
    logService = injector.get(LogService);
    httpMock = injector.get(HttpTestingController);
  });

  describe('#fetchLogs', () => {
    beforeEach(() => {
      logService.getLogs(1, '1', EntityType.policy, null).subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1/logs?filterBy=policyId:1&`);
      expect(req.request.method).toBe('GET');
    });
  });
});
