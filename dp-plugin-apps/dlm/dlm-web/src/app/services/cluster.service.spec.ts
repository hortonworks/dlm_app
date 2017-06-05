import {ClusterService} from './cluster.service';
import {HttpService} from './http.service';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions, RequestMethod} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {ReflectiveInjector} from '@angular/core';
import {Cluster} from '../models/cluster.model';

describe('ClusterService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      {provide: Http, useClass: HttpService},
      Http,
      HttpService,
      ClusterService
    ]);

    this.clusterService = this.injector.get(ClusterService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  describe('#fetchClusters', () => {
    beforeEach(() => {
      this.clusterService.fetchClusters();
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

  describe('#fetchCluster', () => {
    beforeEach(() => {
      this.id = '1';
      this.clusterService.fetchCluster(this.id);
    });
    it('should do GET request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Get);
    });
  });

  describe('#pairWith', () => {
    beforeEach(() => {
      this.cluster = <Cluster>{id: 1};
      this.pair = {};
      this.clusterService.pairWith(this.cluster);
    });
    it('should do POST request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Post);
    });
  });

  describe('#unpair', () => {
    beforeEach(() => {
      this.cluster = <Cluster>{id: 1};
      this.pair = {};
      this.clusterService.unpair(this.cluster);
    });
    it('should do DELETE request', () => {
      expect(this.lastConnection.request.method).toBe(RequestMethod.Delete);
    });
  });

});
