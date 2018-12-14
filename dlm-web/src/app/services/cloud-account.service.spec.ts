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

import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AddCloudStoreRequestBodyForS3, ValidateCredentialsRequestBodyForS3 } from 'models/cloud-account.model';
import { CloudAccountService } from './cloud-account.service';
import { API_PREFIX } from 'constants/api.constant';
import { NotificationService } from 'services/notification.service';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from 'interceptors/api.interceptor';
import { notificationStub } from 'testing/mock-services';

describe('CloudAccountService', () => {
  let injector: TestBed;
  let cloudAccountService: CloudAccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule
      ],
      providers: [
        CloudAccountService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true
        },
        {provide: NotificationService, useValue: notificationStub}
      ]
    });

    injector = getTestBed();
    cloudAccountService = injector.get(CloudAccountService);
    httpMock = injector.get(HttpTestingController);
  });

  describe('#fetchCloudAccounts', () => {
    beforeEach(() => {
      cloudAccountService.fetchAccounts().subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}store/credentials`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#addCloudAccount', () => {
    const cloudStore: AddCloudStoreRequestBodyForS3 = {
      id: 'S3Credential',
      accountDetails: {
        provider: 'S3',
        accountName: 'adffadff',
        userName: 'adfDFS'
      },
      accountCredentials: {
        credentialType: 'S3',
        accessKeyId: 'adagdgadgga',
        secretAccessKey: 'adagadgaf'
      }
    };
    beforeEach(() => {
      cloudAccountService.addCloudStore(cloudStore).subscribe();
    });
    it('should do POST request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}store/credential`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(cloudStore);
    });
  });

  describe('#validateCloudCredentials', () => {
    const cloudCredentials: ValidateCredentialsRequestBodyForS3 = {
      credentialType: 'S3',
      accessKeyId: 'adagdgadgga',
      secretAccessKey: 'adagadgaf'
    };
    beforeEach(() => {
      cloudAccountService.validateCredentials(cloudCredentials).subscribe();
    });
    it('should do POST request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}cloud/userIdentity`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(cloudCredentials);
    });
  });
});
