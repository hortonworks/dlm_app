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
import { getAllLogs, getLogByInstanceId } from 'selectors/log.selector';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { loadLogs } from 'actions/log.action';
import { Cluster } from 'models/cluster.model';
import * as moment from 'moment';
import { getAllClusters } from 'selectors/cluster.selector';
import { parsePolicyId } from 'utils/policy-util';
import { NotificationService } from 'services/notification.service';
import { ToastNotification } from 'models/toast-notification.model';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { TranslateService } from '@ngx-translate/core';

export const LOG_REQUEST = '[LOG_SERVICE] LOG_REQUEST';
export const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export interface LogMetaInfo {
  entityId: string;
  entityType: EntityType;
  clusterId: number;
  timestamp: string;
};

@Injectable()
export class LogService {

  logEventTypeMap = LOG_EVENT_TYPE_MAP;
  private emitter: Subject<string> = new Subject<string>();
  private logMessage$: Observable<string>;
  clusters$: Observable<Cluster[]>;
  clusters: Cluster[];
  logMetaInfo$: BehaviorSubject<LogMetaInfo> = new BehaviorSubject(<LogMetaInfo>{});
  constructor(
    private http: Http,
    private store: Store<State>,
    private notificationService: NotificationService,
    private t: TranslateService
  ) {
    this.logMessage$ = this.logMetaInfo$.switchMap(entity => {
      return this.store.select(getLogByInstanceId(entity.entityId))
        .map((log = {} as Log) => log.message || '');
    });
    this.logMessage$.subscribe(logMessage => this.emitter.next(logMessage));
    this.clusters$ = store.select(getAllClusters);
    this.clusters$.subscribe(clusters => this.clusters = clusters);
  }

  getLogs(clusterId: number, instanceId: string, logType: EntityType, timestamp: string): Observable<any> {
    const filterBy = this.logEventTypeMap[logType];
    let timingQp = '';
    if (timestamp) {
      const date = moment(timestamp);
      const start = date.subtract(1, 'h').format(DATE_FORMAT);
      const end = date.add(12, 'h').format(DATE_FORMAT);
      timingQp = `start=${start}&end=${end}`;
    }
    return this.http.get(`clusters/${clusterId}/logs?filterBy=${filterBy}:${instanceId}&${timingQp}`).map(r => r.json());
  }

  getChangeEmitter() {
    return this.emitter;
  }

  showLog(entityType: EntityType, entityId: string, timestamp = ''): void {
    const parsed = parsePolicyId(entityId);

    if (parsed) {
      const splits = entityId.split('/');
      const dataCenter = parsed.dataCenter;
      const clusterName = parsed.clusterName;
      if (this.clusters) {
        const cluster = this.clusters.find(c => c.dataCenter === dataCenter && c.name === clusterName);
        if (cluster) {
          const clusterId = cluster.id;
          this.store.dispatch(loadLogs(clusterId, entityId, entityType, LOG_REQUEST, timestamp));
          this.logMetaInfo$.next({
            entityId,
            entityType,
            clusterId,
            timestamp
          } as LogMetaInfo);
          return;
        }
      }
    }

    this.notificationService.create({
      type: NOTIFICATION_TYPES.ERROR,
      title: this.t.instant('common.action_notifications.view_log.error.title'),
      body: this.t.instant('common.action_notifications.view_log.error.body')
    } as ToastNotification);
  }
}
