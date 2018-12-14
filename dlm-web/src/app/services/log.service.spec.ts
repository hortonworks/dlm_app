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

import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, getTestBed } from '@angular/core/testing';
import { EntityType } from 'constants/log.constant';
import { NotificationService } from 'services/notification.service';
import { LogService } from './log.service';
import { API_PREFIX } from 'constants/api.constant';
import { AsyncActionsService } from 'services/async-actions.service';
import { Store } from '@ngrx/store';
import { storeStub, notificationStub, asyncActionsStub } from 'testing/mock-services';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from 'interceptors/api.interceptor';

describe('LogService', () => {
  let injector: TestBed;
  let logService: LogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule
      ],
      providers: [
        LogService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true
        },
        { provide: Store, useValue: storeStub },
        { provide: NotificationService, useValue: notificationStub },
        { provide: AsyncActionsService, useValue: asyncActionsStub }
      ]
    });

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
