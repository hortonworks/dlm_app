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
import { Cluster } from 'models/cluster.model';
import { ClusterService } from './cluster.service';

describe('ClusterService', () => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let clusterService: ClusterService;

  beforeEach(() => {

    configureServiceTest({
      providers: [
        ClusterService
      ]
    });

    injector = getTestBed();
    clusterService = injector.get(ClusterService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('#fetchClusters', () => {
    beforeEach(() => {
      clusterService.fetchClusters().subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#fetchCluster', () => {
    beforeEach(() => {
      this.id = '1';
      clusterService.fetchCluster(this.id).subscribe();
    });
    it('should do GET request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}clusters/1`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('#pairWith', () => {
    beforeEach(() => {
      this.cluster = <Cluster>{id: 1};
      this.pair = {};
      clusterService.pairWith(this.cluster, this.pair).subscribe();
    });
    it('should do POST request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}pair/1`);
      expect(req.request.method).toBe('POST');
    });
  });

  describe('#unpair', () => {
    beforeEach(() => {
      this.cluster = <Cluster>{id: 1};
      this.pair = {};
      clusterService.unpair(this.cluster).subscribe();
    });
    it('should do DELETE request', () => {
      const req = httpMock.expectOne(`${API_PREFIX}pair/1`);
      expect(req.request.method).toBe('DELETE');
    });
  });

});
