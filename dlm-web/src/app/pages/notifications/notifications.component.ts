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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';
import { Event } from 'models/event.model';
import { Cluster } from 'models/cluster.model';
import { getAllDisplayedEvents } from 'selectors/event.selector';
import { getAllClusters } from 'selectors/cluster.selector';
import { getAllPolicies } from 'selectors/policy.selector';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { loadEvents } from 'actions/event.action';
import { loadClusters } from 'actions/cluster.action';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { Policy } from 'models/policy.model';
import { loadPolicies } from 'actions/policy.action';
import { PageComponent } from 'pages/page.component';
import { getDlmAppProperties } from 'selectors/dlm-properties.selector';
import { distinctUntilChanged, filter } from 'rxjs/operators';

const CLUSTERS_REQUEST = '[NOTIFICATION_PAGE] CLUSTERS_REQUEST';
const POLICIES_REQUEST = '[NOTIFICATION_PAGE] POLICIES_REQUEST';
const EVENTS_REQUEST = '[NOTIFICATION_PAGE] EVENTS_REQUEST';

@Component({
  selector: 'dlm-notifications-page',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsPageComponent extends PageComponent implements OnInit, OnDestroy {

  events$: Observable<Event[]>;
  clusters$: Observable<Cluster[]>;
  policies$: Observable<Policy[]>;
  overallProgress$: Observable<ProgressState>;
  subscriptions: Subscription[] = [];

  constructor(private store: Store<State>) {
    super();
    this.events$ = store.select(getAllDisplayedEvents);
    this.clusters$ = store.select(getAllClusters);
    this.policies$ = store.select(getAllPolicies);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, EVENTS_REQUEST));
  }

  ngOnInit() {
    const policiesCountSubscription = this.store.select(getDlmAppProperties).pipe(
      filter(prop => prop && prop.policiesCount !== 0),
      distinctUntilChanged()
    ).subscribe(properties => {
        this.store.dispatch(loadEvents({numResults: properties.eventsCount}, {requestId: EVENTS_REQUEST}));
        this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
        this.store.dispatch(loadPolicies({numResults: properties.policiesCount, instanceCount: 10}, {requestId: POLICIES_REQUEST}));
      });
    this.subscriptions.push(policiesCountSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
