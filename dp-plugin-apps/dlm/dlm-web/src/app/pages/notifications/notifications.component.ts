/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
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
import { ALL_POLICIES_COUNT } from 'constants/api.constant';

const CLUSTERS_REQUEST = '[NOTIFICATION_PAGE] CLUSTERS_REQUEST';
const POLICIES_REQUEST = '[NOTIFICATION_PAGE] POLICIES_REQUEST';
const EVENTS_REQUEST = '[NOTIFICATION_PAGE] EVENTS_REQUEST';

@Component({
  selector: 'dlm-notifications-page',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsPageComponent {

  events$: Observable<Event[]>;
  clusters$: Observable<Cluster[]>;
  policies$: Observable<Policy[]>;
  overallProgress$: Observable<ProgressState>;

  constructor(private store: Store<State>) {
    this.events$ = store.select(getAllDisplayedEvents);
    this.clusters$ = store.select(getAllClusters);
    this.policies$ = store.select(getAllPolicies);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, EVENTS_REQUEST));
    this.store.dispatch(loadEvents({numResults: 1000}, {requestId: EVENTS_REQUEST}));
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    this.store.dispatch(loadPolicies({numResults: ALL_POLICIES_COUNT, instanceCount: 10}, {requestId: POLICIES_REQUEST}));
  }

}
