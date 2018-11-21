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


import {forkJoin as observableForkJoin,  Observable, Subscription, timer ,  combineLatest } from 'rxjs';

import { concatMap } from 'rxjs/operators';
import { Component, OnDestroy, OnInit, ViewEncapsulation, isDevMode } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';


import { State } from 'reducers/index';
import { Event } from 'models/event.model';
import { MenuItem } from './common/navbar/menu-item';
import { getAllEventsWithPoliciesFlag } from 'selectors/event.selector';
import { initApp } from 'actions/app.action';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { loadEvents } from 'actions/event.action';
import { User } from './models/user.model';
import { SessionStorageService } from './services/session-storage.service';
import { TimeZoneService } from './services/time-zone.service';
import { POLL_INTERVAL } from 'constants/api.constant';
import { HeaderData } from 'models/header-data';
import { UserService } from 'services/user.service';
import { AuthUtils } from 'utils/auth-utils';
import { AsyncActionsService } from 'services/async-actions.service';
import { OverlayService, OverlayState } from 'services/overlay.service';
import { loadBeaconAdminStatus } from './actions/beacon.action';
import { loadDlmProperties } from './actions/dlm-properties.action';
import { getDlmAppProperties } from './selectors/dlm-properties.selector';
import { DlmPropertiesUI } from './models/dlm-properties.modal';
import { loadBeaconCloudCredsWithPolicies } from './actions/beacon-cloud-cred.action';
import { MENU_ITEM_ID } from 'constants/navbar.constant';
import { CloudAccountUI } from './models/cloud-account.model';
import { getFullAccountsInfo } from './selectors/cloud-account.selector';
import { hasError } from 'utils/cloud-accounts-util';
import { loadAccountsStatus } from 'actions/cloud-account.action';
import { getOnlyStaleClusters } from './selectors/stale-cluster.selector';
import { StaleCluster } from './models/stale-cluster.model';
import { loadStaleClusters } from 'actions/cluster.action';

const POLL_EVENTS_ID = '[DLM_COMPONENT] POLL_EVENT_ID';
const DLM_PROPERTIES_ID = '[DLM_COMPONENT] DLM_PROPERTIES_ID';

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
  subscriptions: Subscription[] = [];
  headerData: HeaderData = new HeaderData();
  overlayState$: Observable<OverlayState>;

  user: User = <User>{};
  dlmProperties$: Observable<DlmPropertiesUI>;
  cloudAccounts$: Observable<CloudAccountUI[]>;
  cloudAccounts: CloudAccountUI[];
  staleClusters$: Observable<StaleCluster[]>;
  staleClusters: StaleCluster[] = [];

  /**
   * This function will make a new API call
   * only after a response is received from the previous call.
   * Before making each call, it waits for POLL_INTERVAL seconds
   */
  private initPolling() {
    const pollingLoop = timer(POLL_INTERVAL).pipe(
      concatMap(_ =>
         observableForkJoin([
            loadClustersStatuses(),
            loadBeaconCloudCredsWithPolicies(),
            loadAccountsStatus(),
            loadStaleClusters()
          ].map(action => this.asyncActions.dispatch(action)))))
      .subscribe(_ => this.initPolling());
    this.subscriptions.push(pollingLoop);
  }

  private updateMenuItems() {
    this.menuItems = this.menuItems.reduce( (items, current) => {
      if (current.id === MENU_ITEM_ID.CLOUD) {
        current.showAlert = this.cloudAccounts.some(account => hasError(account));
      } else if (current.id === MENU_ITEM_ID.CLUSTERS) {
        current.showAlert = !!this.staleClusters.length;
      }
      return items.concat(current);
    }, []);
  }

  constructor(private t: TranslateService,
              private store: Store<State>,
              private sessionStorageService: SessionStorageService,
              private timeZoneService: TimeZoneService,
              private userService: UserService,
              private asyncActions: AsyncActionsService,
              private overlayService: OverlayService) {
    this.user.timezone = timeZoneService.setupUserTimeZone();

    this.header = new MenuItem(
      MENU_ITEM_ID.HEADER,
      t.instant('sidenav.menuItem.header'),
      './overview',
      '',
      'header-icon'
    );
    this.header.iconHtml = '<img src="assets/images/dlm-logo.png" width="30" height="30"/>';
    this.menuItems = [
      new MenuItem(
        MENU_ITEM_ID.OVERVIEW,
        this.t.instant('sidenav.menuItem.overview'),
        './overview',
        'navigation-icon fa fa-fw fa-home',
        'go-to-overview'
      ),
      new MenuItem(
        MENU_ITEM_ID.CLUSTERS,
        t.instant('sidenav.menuItem.clusters'),
        './clusters',
        'navigation-icon fa fa-fw fa-cubes',
        'go-to-clusters'
      ),
      new MenuItem(
        MENU_ITEM_ID.CLOUD,
        t.instant('sidenav.menuItem.cloud_stores'),
        './cloud-accounts',
        'navigation-icon fa fa-fw fa-cloud',
        'go-to-cloud-stores'
      ),
      new MenuItem(
        MENU_ITEM_ID.PAIRINGS,
        t.instant('sidenav.menuItem.pairings'),
        './pairings',
        'navigation-icon fa fa-fw fa-arrows-h',
        'go-to-pairings'
      ),
      new MenuItem(
        MENU_ITEM_ID.POLICIES,
        t.instant('sidenav.menuItem.policies'),
        './policies',
        'navigation-icon fa fa-fw fa-list-alt',
        'go-to-policies'
      )
    ];
    this.events$ = store.select(getAllEventsWithPoliciesFlag);
    this.overlayState$ = this.overlayService.model$;
  }

  getUser(): User {
    return AuthUtils.getUser();
  }

  ngOnInit() {
    this.store.dispatch(initApp());
    this.store.dispatch(loadDlmProperties({requestId: DLM_PROPERTIES_ID}));
    this.store.dispatch(loadEvents(null, { requestId: POLL_EVENTS_ID}));
    this.store.dispatch(loadBeaconAdminStatus());
    this.store.dispatch(loadBeaconCloudCredsWithPolicies());
    this.store.dispatch(loadAccountsStatus());
    this.store.dispatch(loadStaleClusters());
    this.dlmProperties$ = this.store.select(getDlmAppProperties);
    this.cloudAccounts$ = this.store.select(getFullAccountsInfo);
    this.staleClusters$ = this.store.select(getOnlyStaleClusters);

    const clustersRequestSubscription = this.asyncActions.dispatch(loadClusters())
      .subscribe(_ => {
        this.store.dispatch(loadClustersStatuses());
        // Initialize polling inside subscribe() to make sure that
        // polling starts after clusters are loaded to avoid unexpected
        // behavior during data mapping for dependent resources like
        // cluster status etc.
        this.initPolling();
      });
    this.subscriptions.push(clustersRequestSubscription);

    const authUtilsSubscription = AuthUtils.loggedIn$.subscribe(() => {
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
    this.subscriptions.push(authUtilsSubscription);

    const updateMenuItemsSubscription = combineLatest(this.staleClusters$, this.cloudAccounts$)
      .subscribe(([staleClusters, cloudAccounts]) => {
        this.staleClusters = staleClusters;
        this.cloudAccounts = cloudAccounts;
        this.updateMenuItems();
      });
    this.subscriptions.push(updateMenuItemsSubscription);
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
