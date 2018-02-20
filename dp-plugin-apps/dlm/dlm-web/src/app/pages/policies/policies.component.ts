/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { loadPolicies, loadLastJobs } from 'actions/policy.action';
import { loadClusters } from 'actions/cluster.action';
import { Policy } from 'models/policy.model';
import { getPoliciesTableData } from 'selectors/policy.selector';
import { Pairing } from 'models/pairing.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { getAllPairings, getCountPairsForClusters } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { filterCollection } from 'utils/array-util';
import * as fromRoot from 'reducers/';
import { Cluster } from 'models/cluster.model';
import { getAllClusters } from 'selectors/cluster.selector';
import { TableFilterItem } from 'common/table/table-filter/table-filter-item.type';
import { AddEntityButtonComponent } from 'components/add-entity-button/add-entity-button.component';
import { PolicyContent } from './policy-details/policy-content.type';
import { isEqual } from 'utils/object-utils';
import { POLL_INTERVAL, ALL_POLICIES_COUNT } from 'constants/api.constant';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { loadBeaconAdminStatus } from 'actions/beacon.action';
import { AsyncActionsService } from 'services/async-actions.service';

export const ALL = 'all';
const POLICIES_REQUEST = '[POLICY_PAGE] POLICIES_REQUEST';
const CLUSTERS_REQUEST = '[POLICY_PAGE] CLUSTERS_REQUEST';
const PAIRINGS_REQUEST = '[POLICY_PAGE] PAIRINGS_REQUEST';
const ADMIN_STATUS_REQUEST = '[POLICY_PAGE] ADMIN_STATUS_REQUEST';

@Component({
  selector: 'dlm-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoliciesComponent implements OnInit, OnDestroy {
  private lastPolicyToggles;
  policies$: Observable<Policy[]>;
  clusters$: Observable<Cluster[]>;
  pairings$: Observable<Pairing[]>;
  subscriptions: Subscription[] = [];
  overallProgress$: Observable<ProgressState>;

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
  resourceAvailability$: Observable<{canAddPolicy: boolean, canAddPairing: boolean}>;
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

    const pollingLoop = Observable.timer(POLL_INTERVAL)
      .concatMap(_ => this.asyncActions.dispatch(loadPolicies({ numResults: ALL_POLICIES_COUNT })))
      .repeat()
      .subscribe();
    this.subscriptions.push(pollingLoop);
  }

  constructor(
    private store: Store<fromRoot.State>,
    private route: ActivatedRoute,
    private router: Router,
    private asyncActions: AsyncActionsService
  ) {
    this.policies$ = this.store.select(getPoliciesTableData).distinctUntilChanged(isEqual);
    this.clusters$ = store.select(getAllClusters).distinctUntilChanged(isEqual);
    this.pairings$ = store.select(getAllPairings);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, PAIRINGS_REQUEST, ADMIN_STATUS_REQUEST));

    const pairsCount$: Observable<PairsCountEntity> = store.select(getCountPairsForClusters);
    this.filteredPolicies$ = Observable.combineLatest(this.policies$, this.filters$, this.filterByService$)
      .map(([policies, filters, filterByService]) => this.filterPoliciesWithCondition(policies, filters, filterByService));

    this.resourceAvailability$ = Observable
      .combineLatest(this.clusters$, pairsCount$)
      .map(AddEntityButtonComponent.availableActions);

  }

  ngOnInit() {
    this.store.dispatch(loadPolicies({numResults: ALL_POLICIES_COUNT}, {requestId: POLICIES_REQUEST}));
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    this.store.dispatch(loadBeaconAdminStatus({requestId: ADMIN_STATUS_REQUEST}));
    const getPairings = this.clusters$.subscribe(clusters => {
      this.store.dispatch(loadPairings(PAIRINGS_REQUEST));
    });
    const lastJobsWorkaroundSubscription = this.policies$
      .map(policies => policies.filter(policy => !policy.jobs.length &&
        policy.targetClusterResource.id &&
        this.postLoadPolicyIds.indexOf(policy.id) < 0
      ))
      .filter(policies => !!policies.length)
      .subscribe(policies => {
        this.postLoadPolicyIds = policies.map(policy => policy.id);
        this.store.dispatch(loadLastJobs({policies}));
      });
    const startPolling = this.overallProgress$
      .pluck<any, boolean>('isInProgress')
      .filter(isInProgress => !isInProgress)
      .take(1)
      .subscribe(progress => {
        this.initPolling();
      });
    this.subscriptions.push(startPolling);
    this.subscriptions.push(getPairings);
    this.subscriptions.push(lastJobsWorkaroundSubscription);
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

  handleDetailsToggle(event) {
    this.lastPolicyToggles = event;
  }

  addPolicyClickHandler() {
    this.router.navigate(['/policies/create']);
  }
}
