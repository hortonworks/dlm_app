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


import {of as observableOf,  Observable, BehaviorSubject ,  Subject } from 'rxjs';

import {switchMap, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { saveAs } from 'file-saver';

import { EntityType, LOG_EVENT_TYPE_MAP } from 'constants/log.constant';
import { Log } from 'models/log.model';
import { getLogByInstanceId } from 'selectors/log.selector';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { loadLogs } from 'actions/log.action';
import { Cluster } from 'models/cluster.model';
import { getAllClusters } from 'selectors/cluster.selector';
import { parsePolicyId } from 'utils/policy-util';
import { NotificationService } from 'services/notification.service';
import { ToastNotification } from 'models/toast-notification.model';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { TranslateService } from '@ngx-translate/core';
import { Policy } from 'models/policy.model';
import { getAllPoliciesWithClusters } from 'selectors/policy.selector';
import { AsyncActionsService } from 'services/async-actions.service';
import { loadPolicies } from 'actions/policy.action';
import { isEmpty } from 'utils/object-utils';
import { loadClusters } from 'actions/cluster.action';

export const LOG_REQUEST = '[LOG_SERVICE] LOG_REQUEST';
export const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export interface LogMetaInfo {
  entityId: string;
  entityType: EntityType;
  clusterId: number;
  timestamp: string;
}

@Injectable()
export class LogService {
  private emitter: Subject<string> = new Subject<string>();
  private logMessage$: Observable<string>;

  logEventTypeMap = LOG_EVENT_TYPE_MAP;
  clusters$: Observable<Cluster[]>;
  clusters: Cluster[];
  policies$: Observable<Policy[]>;
  policies: Policy[];
  logMetaInfo$: BehaviorSubject<LogMetaInfo> = new BehaviorSubject(<LogMetaInfo>{});

  private generateFileName(log: LogMetaInfo): string {
    const parsed = parsePolicyId(this.logMetaInfo$.getValue().entityId);
    if (parsed) {
      return `${parsed.policyName}${parsed.jobId ? '_' + parsed.jobId : ''}_${parsed.timeStamp}.txt`;
    }
    return `log_${log.clusterId}_${log.timestamp || Date.now()}.txt`;
  }

  constructor(
    private httpClient: HttpClient,
    private store: Store<State>,
    private notificationService: NotificationService,
    private t: TranslateService,
    private asyncActions: AsyncActionsService
  ) {
    this.logMessage$ = this.logMetaInfo$.pipe(switchMap(entity => {
      return this.store.select(getLogByInstanceId(entity.entityId)).pipe(
        map((log = {} as Log) => log.message || ''));
    }));
    this.logMessage$.subscribe(logMessage => this.emitter.next(logMessage));
    this.clusters$ = store.select(getAllClusters);
    this.clusters$.subscribe(clusters => this.clusters = clusters);
    this.policies$ = store.select(getAllPoliciesWithClusters);
    this.policies$.subscribe(policies => this.policies = policies);
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
    return this.httpClient.get<any>(`clusters/${clusterId}/logs?filterBy=${filterBy}:${instanceId}&${timingQp}`);
  }

  getChangeEmitter() {
    return this.emitter;
  }

  private findPolicy(policyId: string): Policy {
    return this.policies.find(p => p.policyId === policyId);
  }

  private getClusterForRequest(policyId: string): Observable<Cluster> {
    const noop = observableOf(null);
    const policy = this.findPolicy(policyId);
    if (!policy) {
      const { policyName } = parsePolicyId(policyId);
      return this.asyncActions.dispatch(loadPolicies({filterBy: `name:${policyName}`})).pipe(
        switchMap(_ => {
          const p = this.findPolicy(policyId);
          if (!p) {
            return noop;
          }
          if (isEmpty(p.clusterResourceForRequests || {})) {
            return this.asyncActions.dispatch(loadClusters()).pipe(
              map(__ => this.findPolicy(policyId).clusterResourceForRequests));
          }
          return observableOf(p.clusterResourceForRequests);
        }));
    } else if (isEmpty(policy.clusterResourceForRequests || {})) {
      return this.asyncActions.dispatch(loadClusters()).pipe(
        map(_ => this.findPolicy(policyId).clusterResourceForRequests));
    }
    return observableOf(policy.clusterResourceForRequests);
  }

  showLog(entityType: EntityType, entityId: string, timestamp = ''): void {
    const parsed = parsePolicyId(entityId);
    if (parsed) {
      const { policyId, policyName } = parsed;
      if (this.clusters) {
        this.getClusterForRequest(policyId).subscribe(cluster => {
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
          const errorMessage = policyName ? this.t.instant('common.action_notifications.view_log.error.policy_removed', {policyName}) :
            this.t.instant('common.action_notifications.view_log.error.body');
          this.notificationService.create({
            type: NOTIFICATION_TYPES.ERROR,
            title: this.t.instant('common.action_notifications.view_log.error.title'),
            body: errorMessage
          } as ToastNotification);
        });
      }
    }
  }

  downloadLog(log: LogMetaInfo, message: string): void {
    const blob = new Blob([message], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, this.generateFileName(log));
  }
}
