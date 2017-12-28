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

import { Pairing, PairingRequestBody } from 'models/pairing.model';
import { PairingService } from './pairing.service';
import { configureServiceTest } from 'testing/configure';
import { API_PREFIX } from 'constants/api.constant';

describe('PairingService', () => {
  let injector: TestBed;
  let pairingService: PairingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    configureServiceTest({
      providers: [
        PairingService
      ]
    });

    injector = getTestBed();
    pairingService = injector.get(PairingService);
    httpMock = injector.get(HttpTestingController);
  });

  describe('#fetchPairings', () => {
    beforeEach(() => {
      pairingService.fetchPairings().subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}pairs`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#createPairing', () => {
    const pairing: PairingRequestBody = [
      {clusterId: 1, beaconUrl: 'url1'},
      {clusterId: 2, beaconUrl: 'url2'},
    ];
    beforeEach(() => {
      pairingService.createPairing(pairing).subscribe();
    });
    it('should do POST request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}pair`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(pairing);
    });
  });

});
