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

import { Component, OnDestroy, OnInit, ViewEncapsulation, isDevMode } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';


import { State } from 'reducers/index';
import { Event } from 'models/event.model';
import { MenuItem } from './common/navbar/menu-item';
import { getAllEventsWithPoliciesFlag, getNewEventsCount } from 'selectors/event.selector';
import { getMergedProgress, getProgressState } from 'selectors/progress.selector';
import { initApp } from 'actions/app.action';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { loadEvents, loadNewEventsCount } from 'actions/event.action';
import { User } from './models/user.model';
import { SessionStorageService } from './services/session-storage.service';
import { TimeZoneService } from './services/time-zone.service';
import { POLL_INTERVAL } from 'constants/api.constant';
import { HeaderData } from 'models/header-data';
import { UserService } from 'services/user.service';
import { AuthUtils } from 'utils/auth-utils';
import { AsyncActionsService } from 'services/async-actions.service';
import { OverlayService, OverlayState } from 'services/overlay.service';

const POLL_EVENTS_ID = '[DLM_COMPONENT] POLL_EVENT_ID';
const POLL_NEW_EVENTS_ID = '[DLM_COMPONENT] POLL_NEW_EVENTS_ID';

@Component({
  selector: 'dlm',
  templateUrl: './dlm.component.html',
  styleUrls: ['./dlm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DlmComponent implements OnDestroy, OnInit {
  private lastEventTimeStamp: string;

  header: MenuItem;
  menuItems: MenuItem[];
  mainContentSelector = '#dlm_main_content';
  fitHeight = true;
  events$: Observable<Event[]>;
  newEventsCount$: Observable<number>;
  subscriptions: Subscription[] = [];
  headerData: HeaderData = new HeaderData();
  overlayState$: Observable<OverlayState>;

  user: User = <User>{};

  private initPolling() {
    const pollingLoop = Observable.timer(POLL_INTERVAL)
      .concatMap(_ => this.asyncActions.dispatch(loadClustersStatuses()))
      .repeat()
      .subscribe();

    this.subscriptions.push(pollingLoop);
  }

  constructor(t: TranslateService,
              private store: Store<State>,
              private sessionStorageService: SessionStorageService,
              private timeZoneService: TimeZoneService,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private asyncActions: AsyncActionsService,
              private overlayService: OverlayService) {
    this.user.timezone = timeZoneService.setupUserTimeZone();

    this.header = new MenuItem(
      t.instant('sidenav.menuItem.header'),
      './overview',
      '',
      'header-icon'
    );
    this.header.iconHtml = '<img src="assets/images/dlm-logo.png" width="30" height="30"></img>';
    this.menuItems = [
      new MenuItem(
        t.instant('sidenav.menuItem.overview'),
        './overview',
        'navigation-icon fa fa-fw fa-home',
        'go-to-overview'
      ),
      new MenuItem(
        t.instant('sidenav.menuItem.clusters'),
        './clusters',
        'navigation-icon fa fa-fw fa-cubes',
        'go-to-clusters'
      ),
      new MenuItem(
        t.instant('sidenav.menuItem.cloud_stores'),
        './cloud-accounts',
        'navigation-icon fa fa-fw fa-cloud',
        'go-to-cloud-stores'
      ),
      new MenuItem(
        t.instant('sidenav.menuItem.pairings'),
        './pairings',
        'navigation-icon fa fa-fw fa-arrows-h',
        'go-to-pairings'
      ),
      new MenuItem(
        t.instant('sidenav.menuItem.policies'),
        './policies',
        'navigation-icon fa fa-fw fa-list-alt',
        'go-to-policies'
      )
    ];
    this.events$ = store.select(getAllEventsWithPoliciesFlag)
      .do((events: Event[]) => {
        if (events.length) {
          this.lastEventTimeStamp = events[0].timestamp;
        }
      });
    this.newEventsCount$ = store.select(getNewEventsCount);
    this.overlayState$ = this.overlayService.model$;
  }

  getUser(): User {
    return AuthUtils.getUser();
  }

  ngOnInit() {
    this.store.dispatch(initApp());
    this.store.dispatch(loadNewEventsCount({requestId: POLL_NEW_EVENTS_ID}));
    this.store.dispatch(loadEvents(null, { requestId: POLL_EVENTS_ID}));
    const clustersRequestSubscription = this.asyncActions.dispatch(loadClusters())
      .subscribe(_ => {
        this.store.dispatch(loadClustersStatuses());
        this.initPolling();
      });
    this.subscriptions.push(clustersRequestSubscription);
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
