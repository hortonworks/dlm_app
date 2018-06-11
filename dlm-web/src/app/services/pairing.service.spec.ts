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
