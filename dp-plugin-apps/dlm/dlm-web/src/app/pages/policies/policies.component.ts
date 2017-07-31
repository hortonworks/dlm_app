import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { loadPolicies, loadLastJobs } from 'actions/policy.action';
import { loadClusters } from 'actions/cluster.action';
import { loadJobsForClusters } from 'actions/job.action';
import { Policy } from 'models/policy.model';
import { getPolicyClusterJob } from 'selectors/policy.selector';
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
import { POLL_INTERVAL } from 'constants/api.constant';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';

export const ALL = 'all';
const POLICIES_REQUEST = '[POLICY_PAGE] POLICIES_REQUEST';
const CLUSTERS_REQUEST = '[POLICY_PAGE] CLUSTERS_REQUEST';
const PAIRINGS_REQUEST = '[POLICY_PAGE] PAIRINGS_REQUEST';

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
  policiesLoaded = false;

  /**
   * Flag is set to `true` when initial loading is complete (spinner becomes hidden)
   * Its value is used for start polling. Polling can't be started before initial loading is completed.
   * Otherwise infinity "loading" state will be on the page
   * @type {boolean}
   */
  initialLoadingComplete = false;
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
    {multiple: true, propertyName: 'status'},
    {multiple: true, propertyName: 'name'}
  ];
  initialFilters: {propertyName: string, value: string []} [];

  private initPolling() {
    const polling$ = Observable.interval(POLL_INTERVAL)
      .filter(_ => !this.lastPolicyToggles ||
        (this.lastPolicyToggles.expanded && this.lastPolicyToggles.contentType === PolicyContent.Jobs))
      .filter(_ => this.policiesLoaded)
      .filter(_ => this.initialLoadingComplete)
      .do(_ => {
        this.store.dispatch(loadPolicies());
        this.policiesLoaded = false;
      });
    this.subscriptions.push(polling$.subscribe());
  }

  constructor(private store: Store<fromRoot.State>, private route: ActivatedRoute) {
    this.policies$ = this.store.select(getPolicyClusterJob).distinctUntilChanged(isEqual);
    this.subscriptions.push(this.policies$.subscribe(_ => this.policiesLoaded = true));
    this.clusters$ = store.select(getAllClusters);
    this.pairings$ = store.select(getAllPairings);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, PAIRINGS_REQUEST));
    this.subscriptions.push(this.overallProgress$.subscribe(progress => {
      if (progress.success) {
        this.initialLoadingComplete = true;
      }
    }));
    const pairsCount$: Observable<PairsCountEntity> = store.select(getCountPairsForClusters);
    this.filteredPolicies$ = Observable.combineLatest(this.policies$, this.filters$, this.filterByService$)
      .map(([policies, filters, filterByService]) => this.filterPoliciesWithCondition(policies, filters, filterByService));

    this.resourceAvailability$ = Observable
      .combineLatest(this.clusters$, pairsCount$)
      .map(AddEntityButtonComponent.availableActions);
  }

  ngOnInit() {
    this.store.dispatch(loadPolicies(POLICIES_REQUEST));
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    const clusterSubscription = this.clusters$.subscribe(clusters => {
      const clusterIds = clusters.map(c => c.id);
      this.store.dispatch(loadPairings(PAIRINGS_REQUEST));
      this.store.dispatch(loadJobsForClusters(clusterIds));
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
    this.subscriptions.push(clusterSubscription);
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
    this.initPolling();
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
}
