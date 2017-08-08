/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { EntityType, LOG_EVENT_TYPE_MAP } from 'constants/log.constant';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Log } from 'models/log.model';
import { getAllLogs } from 'selectors/log.selector';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { loadLogs } from 'actions/log.action';
import { Cluster } from 'models/cluster.model';
import { loadClusters } from 'actions/cluster.action';
import { getAllClusters } from 'selectors/cluster.selector';

export const LOG_REQUEST = '[LOG_SERVICE] LOG_REQUEST';

@Injectable()
export class LogService {

  logEventTypeMap = LOG_EVENT_TYPE_MAP;
  private emitter: Subject<string> = new Subject<string>();
  private logMessage$: Observable<string>;
  clusters$: Observable<Cluster[]>;
  clusters: Cluster[];
  entityId$: BehaviorSubject<string> = new BehaviorSubject(<string>{});
  constructor(private http: Http,  private store: Store<State>) {
    this.logMessage$ = this.entityId$.switchMap(entityId => {
      return this.store.select(getAllLogs).map(logs => {
        const filteredLogs: Log[] = logs.filter(log => log.instanceId === entityId);
        return filteredLogs.length ? filteredLogs[0].message : '';
      });
    });
    this.logMessage$.subscribe(logMessage => this.emitter.next(logMessage));
    this.clusters$ = store.select(getAllClusters);
    this.clusters$.subscribe(clusters => this.clusters = clusters);
  }

  getLogs(clusterId: number, instanceId: string, logType: EntityType): Observable<any> {
    const filterBy = this.logEventTypeMap[logType];
    return this.http.get(`clusters/${clusterId}/logs?filterBy=${filterBy}:${instanceId}`).map(r => r.json());
  }

  getChangeEmitter() {
    return this.emitter;
  }

  showLog(entityType: EntityType, entityId: string) {
    if (entityId) {
      const splits = entityId.split('/');
      if (splits.length >= 5 && splits[3] && splits[4]) {
        // Extract target cluster name and data center name from policy id or instance id in format
        // "policyId": "/beaconsource/beaconsource/beacontarget/beacontarget/hdfsdr/0/1494924228843/000000002"
        const dataCenter = splits[3];
        const clusterName = splits[4];
        if (this.clusters) {
          const filteredClusters = this.clusters.filter(cluster => cluster.dataCenter === dataCenter && cluster.name === clusterName);
          if (filteredClusters.length) {
            const clusterId = filteredClusters[0].id;
            this.store.dispatch(loadLogs(clusterId, entityId, entityType, LOG_REQUEST));
            this.entityId$.next(entityId);
          }
        }
      }
    }
  }
}
