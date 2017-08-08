/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnDestroy, OnInit, ViewEncapsulation, isDevMode } from '@angular/core';
import { MenuItem } from './common/navbar/menu-item';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { TranslateService } from '@ngx-translate/core';
import { Event } from 'models/event.model';
import { Observable } from 'rxjs/Observable';
import { getAllEvents, getNewEventsCount } from 'selectors/event.selector';
import { getMergedProgress, getProgressState } from 'selectors/progress.selector';
import { initApp } from 'actions/app.action';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { loadEvents, loadNewEventsCount } from 'actions/event.action';
import { NAVIGATION } from 'constants/navigation.constant';
import { User } from './models/user.model';
import { SessionStorageService } from './services/session-storage.service';
import { TimeZoneService } from './services/time-zone.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { POLL_INTERVAL } from 'constants/api.constant';
import { HeaderData, Persona } from 'models/header-data';
import { UserService } from 'services/user.service';
import { AuthUtils } from 'utils/auth-utils';
import { getAllClusters } from 'selectors/cluster.selector';

const POLL_EVENTS_ID = '[DLM_COMPONENT] POLL_EVENT_ID';
const POLL_NEW_EVENTS_ID = '[DLM_COMPONENT] POLL_NEW_EVENTS_ID';
const POLL_CLUSTER_STATUSES_ID = '[DLM_COMPONENT] POLL_CLUSTER_STATUSES_ID';
const CLUSTERS_REQUEST = '[DLM_COMPONENT] CLUSTERS_REQUEST';

@Component({
  selector: 'dlm',
  templateUrl: './dlm.component.html',
  styleUrls: ['./dlm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DlmComponent implements OnDestroy, OnInit {
  header: MenuItem;
  menuItems: MenuItem[];
  mainContentSelector = '#dlm_main_content';
  fitHeight = true;
  events$: Observable<Event[]>;
  newEventsCount$: Observable<number>;
  navigationColumns = NAVIGATION;
  onOverviewPage = false;
  subscriptions: Subscription[] = [];
  headerData: HeaderData = new HeaderData();

  // Options for Toast Notification
  notificationOptions = {
    position: ['top', 'right'],
    showProgressBar: false,
    lastOnBottom: false,
    theClass: 'toast-notification',
    timeOut: 10000
  };

  user: User = <User>{};

  private initPolling() {
    const pollProgress$ = this.store
      .select(getMergedProgress(POLL_EVENTS_ID, POLL_NEW_EVENTS_ID, POLL_CLUSTER_STATUSES_ID))
      .map(r => r.isInProgress)
      .distinctUntilChanged()
      .filter(isInProgress => !isInProgress)
      .delay(POLL_INTERVAL)
      .do(_ => {
        this.store.dispatch(loadNewEventsCount({requestId: POLL_NEW_EVENTS_ID}));
        this.store.dispatch(loadEvents({ requestId: POLL_EVENTS_ID}));
        this.store.dispatch(loadClustersStatuses(POLL_CLUSTER_STATUSES_ID));
      })
      .repeat();

    this.subscriptions.push(pollProgress$.subscribe());
  }

  constructor(t: TranslateService,
              private store: Store<State>,
              private sessionStorageService: SessionStorageService,
              private timeZoneService: TimeZoneService,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute) {
    this.user.timezone = timeZoneService.setupUserTimeZone();

    this.header = new MenuItem(
      t.instant('sidenav.menuItem.header'),
      './overview',
      '',
      'header-icon'
    );
    this.header.iconHtml = '<i class="fa fa-gg" aria-hidden="true"></i>';
    this.menuItems = [
      new MenuItem(
        t.instant('sidenav.menuItem.overview'),
        './overview',
        'navigation-icon fa fa-home',
        'go-to-overview'
      ),
      new MenuItem(
        t.instant('sidenav.menuItem.clusters'),
        './clusters',
        'navigation-icon fa fa-globe',
        'go-to-clusters'
      ),
      new MenuItem(
        t.instant('sidenav.menuItem.pairings'),
        './pairings',
        'navigation-icon fa fa-arrows-h',
        'go-to-pairings'
      ),
      new MenuItem(
        t.instant('sidenav.menuItem.policies'),
        './policies',
        'navigation-icon fa fa-th-list',
        'go-to-policies'
      )
    ];
    this.events$ = store.select(getAllEvents);
    this.newEventsCount$ = store.select(getNewEventsCount);
    this.store.dispatch(initApp());
    this.store.dispatch(loadNewEventsCount({requestId: POLL_NEW_EVENTS_ID}));
    this.store.dispatch(loadEvents({ requestId: POLL_EVENTS_ID}));
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    const pathChange$ = router.events
      .filter(e => e instanceof NavigationEnd)
      .do(_ => {
        this.onOverviewPage = this.checkTopPath(route, 'overview');
      });
    const clustersRequestSubscription = this.store.select(getProgressState(CLUSTERS_REQUEST))
      .filter(progressState => !progressState.isInProgress)
      .take(1)
      .do(_ => this.store.dispatch(loadClustersStatuses(POLL_CLUSTER_STATUSES_ID)))
      .subscribe(_ => this.initPolling());
    this.subscriptions.push(clustersRequestSubscription);
    this.subscriptions.push(pathChange$.subscribe());
  }

  private checkTopPath(route, path) {
    const {children} = route;
    if (!children.length) {
      return false;
    }
    const {url} = children[0];
    if (!url) {
      return false;
    }
    const urlValue = url.getValue();
    if (!urlValue.length) {
      return false;
    }
    return urlValue[0].path === path;
  }

  getUser(): User {
    return AuthUtils.getUser();
  }

  ngOnInit() {
    AuthUtils.loggedIn$.subscribe(() => {
      this.setHeaderData();
      const user = this.getUser();
      if (user && user.id) {
        this.user = user;
      } else {
        if (!isDevMode()) {
          // Log the user out of DLM
          this.userService.logoutUser();
        }
      }
    });
  }

  setHeaderData() {
    this.headerData.personas = this.userService.getPersonaDetails();
  }

  saveUserTimezone(timezoneIndex) {
    // todo save not only in the local storage
    this.sessionStorageService.set('tz', timezoneIndex);
    this.timeZoneService.setTimezone(timezoneIndex);
  }

  logout() {
    // do logout
    this.userService.logoutUser();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
