/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { LogService } from './log.service';
import { HttpService } from './http.service';
import { BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ReflectiveInjector } from '@angular/core';
import { Store } from '@ngrx/store';
import { MockStore } from 'mocks/mock-store';
import { EntityType } from 'constants/log.constant';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'services/notification.service';

describe('LogService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      {provide: Store, useClass: MockStore},
      {
        provide: NotificationService,
        useValue: jasmine.createSpyObj('notificationService', ['create'])
      },
      Http,
      HttpService,
      {
        provide: TranslateService,
        useValue: jasmine.createSpyObj('t', ['instant'])
      },
      LogService
    ]);

    this.logService = this.injector.get(LogService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  describe('#fetchLogs', () => {
    beforeEach(() => {
      this.logService.getLogs(1, '1', EntityType.policy);
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });
});
