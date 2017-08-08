/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { HttpService } from './http.service';
import { BaseRequestOptions, ConnectionBackend, Http, RequestOptions, RequestMethod } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ReflectiveInjector } from '@angular/core';
import { Pairing } from '../models/pairing.model';
import { PairingService } from './pairing.service';

describe('PairingService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      { provide: ConnectionBackend, useClass: MockBackend },
      { provide: RequestOptions, useClass: BaseRequestOptions },
      { provide: Http, useClass: HttpService },
      Http,
      HttpService,
      PairingService
    ]);

    this.pairingService = this.injector.get(PairingService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  describe('#fetchPairings', () => {
    beforeEach(() => {
      this.pairingService.fetchPairings();
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

  describe('#createPairing', () => {
    beforeEach(() => {
      this.pairing = <Pairing>{id: '1'};
      this.pair = {};
      this.pairingService.createPairing(this.pairing);
    });
    it('should do POST request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Post);
    });
  });

});
