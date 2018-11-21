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


import {combineLatest as observableCombineLatest, timer as observableTimer,  Observable, BehaviorSubject, Subscription } from 'rxjs';

import {take, pluck, concatMap, repeat, distinctUntilChanged, map, filter} from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadPolicies } from 'actions/policy.action';
import { loadClusters } from 'actions/cluster.action';
import { Policy } from 'models/policy.model';
import { getPoliciesTableData } from 'selectors/policy.selector';
import { Pairing } from 'models/pairing.model';
import { getAllPairings } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { filterCollection } from 'utils/array-util';
import * as fromRoot from 'reducers/';
import { Cluster } from 'models/cluster.model';
import { getClustersWithBeacon } from 'selectors/cluster.selector';
import { TableFilterItem } from 'common/table/table-filter/table-filter-item.type';
import { loadBeaconCloudCreds } from 'actions/beacon-cloud-cred.action';
import { isEqual } from 'utils/object-utils';
import { POLL_INTERVAL } from 'constants/api.constant';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { loadBeaconAdminStatus, loadBeaconConfigStatus } from 'actions/beacon.action';
import { AsyncActionsService } from 'services/async-actions.service';
import { DlmPropertiesService } from 'services/dlm-properties.service';
import { getAvailableEntityActions, AvailableEntityActions } from 'selectors/operation.selector';
import { loadAccounts } from 'actions/cloud-account.action';
import { PageComponent } from 'pages/page.component';

export const ALL = 'all';
const POLICIES_REQUEST = '[POLICY_PAGE] POLICIES_REQUEST';
const CLUSTERS_REQUEST = '[POLICY_PAGE] CLUSTERS_REQUEST';
const PAIRINGS_REQUEST = '[POLICY_PAGE] PAIRINGS_REQUEST';
const CLOUD_CREDENTIALS_REQUEST = '[POLICY_PAGE] CLOUD_CREDENTIALS_REQUEST';
const ADMIN_STATUS_REQUEST = '[POLICY_PAGE] ADMIN_STATUS_REQUEST';

@Component({
  selector: 'dlm-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoliciesComponent extends PageComponent implements OnInit, OnDestroy {
  policies$: Observable<Policy[]>;
  clusters$: Observable<Cluster[]>;
  pairings$: Observable<Pairing[]>;
  subscriptions: Subscription[] = [];
  overallProgress$: Observable<ProgressState>;
  // Default policies query count is updated from dlm properties API
  policiesQueryCount = 0;

  /**
   * Flag is set to `true` after request for policies is completed
   * Flag is set to `false` after request for policies is started
   * @type {boolean}
   */

  /**
   * Flag is set to `true` when initial loading is complete (spinner becomes hidden)
   * Its value is used for start polling. Polling can't be started before initial loading is completed.
   * Otherwise infinity "loading" state will be on the page
   * @type {boolean}
   */
  activePolicyId = '';
  resourceAvailability$: Observable<AvailableEntityActions>;
  filteredPolicies$: Observable<Policy[]>;
  filters$: BehaviorSubject<any> = new BehaviorSubject({});
  filterByService$: BehaviorSubject<any> = new BehaviorSubject('');
  // holds list of policy id which has initially 0 last jobs because of API error.
  // as workaround we need to load 3 jobs for such policies and set result to `jobs` and `lastJobs`
  postLoadPolicyIds: string[] = [];
  filterBy: TableFilterItem[] = [
    {multiple: true, propertyName: 'sourceClusterResource.name', filterTitle: 'Source Cluster'},
    {multiple: false, propertyName: 'targetClusterResource.name', filterTitle: 'Destination Cluster'},
    {multiple: true, propertyName: 'sourceClusterResource.dataCenter', filterTitle: 'Source Datacenter'},
    {multiple: false, propertyName: 'targetClusterResource.dataCenter', filterTitle: 'Destination Datacenter'},
    {multiple: true, propertyName: 'displayStatus', filterTitle: 'Status'},
    {multiple: true, propertyName: 'name'}
  ];
  initialFilters: {propertyName: string, value: string []} [];

  private initPolling() {
    const pollingLoop = observableTimer(POLL_INTERVAL).pipe(
      concatMap(_ => this.asyncActions.dispatch(loadPolicies({ numResults: this.policiesQueryCount, instanceCount: 3 }))),
      repeat(), )
      .subscribe();
    this.subscriptions.push(pollingLoop);
  }

  constructor(
    private store: Store<fromRoot.State>,
    private route: ActivatedRoute,
    private asyncActions: AsyncActionsService,
    private dlmPropertiesService: DlmPropertiesService
  ) {
    super();
    this.policies$ = this.store.select(getPoliciesTableData);
    this.clusters$ = this.store.select(getClustersWithBeacon).pipe(distinctUntilChanged(isEqual));
    this.pairings$ = this.store.select(getAllPairings);
    this.overallProgress$ = this.store.select(getMergedProgress(
      POLICIES_REQUEST,
      CLUSTERS_REQUEST,
      PAIRINGS_REQUEST,
      ADMIN_STATUS_REQUEST
    ));

    this.filteredPolicies$ = observableCombineLatest(this.policies$, this.filters$, this.filterByService$).pipe(
      map(([policies, filters, filterByService]) => this.filterPoliciesWithCondition(policies, filters, filterByService)));

    this.resourceAvailability$ = store.select(getAvailableEntityActions);
  }

  ngOnInit() {
    const policiesCountSubscription = this.dlmPropertiesService.getPoliciesQueryCount$()
      .subscribe(count => this.policiesQueryCount = count);
    this.subscriptions.push(policiesCountSubscription);
    this.store.dispatch(loadPolicies({numResults: this.policiesQueryCount, instanceCount: 3}, {requestId: POLICIES_REQUEST}));
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    this.store.dispatch(loadBeaconAdminStatus({requestId: ADMIN_STATUS_REQUEST}));
    this.store.dispatch(loadBeaconCloudCreds({requestId: CLOUD_CREDENTIALS_REQUEST}));
    this.store.dispatch(loadAccounts());
    this.store.dispatch(loadBeaconConfigStatus());
    const getPairings = this.clusters$.subscribe(_ => {
      this.store.dispatch(loadPairings(PAIRINGS_REQUEST));
    });
    const startPolling = this.overallProgress$.pipe(
      pluck<any, boolean>('isInProgress'),
      filter(isInProgress => !isInProgress),
      take(1), )
      .subscribe(progress => {
        this.initPolling();
      });
    this.subscriptions.push(startPolling);
    this.subscriptions.push(getPairings);

    this.route.queryParams.subscribe(params => {
      this.activePolicyId = params['policy'];
      if (params['policy']) {
        this.initialFilters = [
          {
            propertyName: 'name',
            value: [params['policy']]
          }
        ];
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  filterPoliciesWithCondition(policies, filters, filterByService) {
    const filtered = filterCollection(policies, filters);
    return filterByService ? filtered.filter(policy => policy.type === filterByService) : filtered;
  }

  onFilter(filters) {
    this.filters$.next(filters);
  }

  filterPoliciesByService(type) {
    this.filterByService$.next(type);
  }
}
