/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { AddCloudStoreRequestBody, ValidateCredentialsRequestBody } from 'models/cloud-account.model';
import { CloudAccountService } from './cloud-account.service';
import { configureServiceTest } from 'testing/configure';
import { API_PREFIX } from 'constants/api.constant';
import { NotificationService } from 'services/notification.service';
import { NotificationsService } from 'angular2-notifications';

describe('CloudAccountService', () => {
  let injector: TestBed;
  let cloudAccountService: CloudAccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    configureServiceTest({
      providers: [
        CloudAccountService,
        NotificationService,
        NotificationsService
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
    const cloudStore: AddCloudStoreRequestBody = {
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
    const cloudCredentials: ValidateCredentialsRequestBody = {
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
