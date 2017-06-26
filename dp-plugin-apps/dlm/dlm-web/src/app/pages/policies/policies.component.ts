import { Component, OnInit, OnDestroy } from '@angular/core';
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

export const ALL = 'all';

@Component({
  selector: 'dlm-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit, OnDestroy {
  policies$: Observable<Policy[]>;
  clusters$: Observable<Cluster[]>;
  pairings$: Observable<Pairing[]>;
  subscriptions: Subscription[] = [];
  activePolicyId = '';
  resourceAvailability$: Observable<{canAddPolicy: boolean, canAddPairing: boolean}>;
  filteredPolicies$: Observable<Policy[]>;
  filters$: BehaviorSubject<any> = new BehaviorSubject({});
  filterByService$: BehaviorSubject<any> = new BehaviorSubject('');
  // holds list of policy id which has initialiy 0 last jobs because of API error.
  // as workaround we need to load 3 jobs for such policies and set result to `jobs` and `lastJobs`
  postLoadPolicyIds: string[] = [];
  filterBy: TableFilterItem[] = [
    {multiple: true, propertyName: 'sourceCluster'},
    {multiple: false, propertyName: 'targetCluster'},
    {multiple: true, propertyName: 'status'},
    {multiple: true, propertyName: 'name'}
  ];

  constructor(private store: Store<fromRoot.State>, private route: ActivatedRoute) {
    this.policies$ = this.store.select(getPolicyClusterJob);
    this.clusters$ = store.select(getAllClusters);
    this.pairings$ = store.select(getAllPairings);
    const pairsCount$: Observable<PairsCountEntity> = store.select(getCountPairsForClusters);
    this.filteredPolicies$ = Observable.combineLatest(this.policies$, this.filters$, this.filterByService$)
      .map(([policies, filters, filterByService]) => this.filterPoliciesWithCondition(policies, filters, filterByService));

    this.resourceAvailability$ = Observable
      .combineLatest(this.clusters$, pairsCount$)
      .map(AddEntityButtonComponent.availableActions);
  }

  ngOnInit() {
    [loadPolicies, loadClusters].map(action => this.store.dispatch(action()));
    const clusterSubscription = this.clusters$.subscribe(clusters => {
      const clusterIds = clusters.map(c => c.id);
      this.store.dispatch(loadPairings());
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
        this.store.dispatch(loadLastJobs(policies));
      });
    this.subscriptions.push(clusterSubscription);
    this.subscriptions.push(lastJobsWorkaroundSubscription);
    this.route.queryParams.subscribe(params => {
      this.activePolicyId = params['policy'];
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
