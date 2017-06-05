import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { loadPolicies } from 'actions/policy.action';
import { loadClusters } from 'actions/cluster.action';
import { loadJobsForClusters } from 'actions/job.action';
import { listFiles } from 'actions/hdfslist.action';
import { Policy } from 'models/policy.model';
import { getPolicyClusterJob } from 'selectors/policy.selector';
import { Pairing } from 'models/pairing.model';
import { getAllPairings } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { filterCollection } from 'utils/array-util';
import * as fromRoot from 'reducers/';
import { Cluster } from 'models/cluster.model';
import { getAllClusters } from 'selectors/cluster.selector';
import { TableFilterItem } from 'common/table/table-filter/table-filter-item.type';

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
  clustersSubscription: Subscription;
  filteredPolicies$: Observable<Policy[]>;
  filters$: BehaviorSubject<any> = new BehaviorSubject({});
  filterByService$: BehaviorSubject<any> = new BehaviorSubject('');
  filterBy: TableFilterItem[] = [
    {multiple: true, propertyName: 'sourceCluster'},
    {multiple: false, propertyName: 'targetCluster'},
    {multiple: true, propertyName: 'status'},
    {multiple: true, propertyName: 'name'}
  ];

  constructor(private store: Store<fromRoot.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.policies$ = this.store.select(getPolicyClusterJob);
    this.clusters$ = store.select(getAllClusters);
    this.pairings$ = store.select(getAllPairings);

    this.clustersSubscription = this.clusters$.subscribe(clusters => {
      const clusterIds = clusters.map(c => c.id);
      store.dispatch(loadPairings());
      store.dispatch(loadJobsForClusters(clusterIds));
    });
    this.filteredPolicies$ = Observable.combineLatest(this.policies$, this.filters$, this.filterByService$)
      .map(([policies, filters, filterByService]) => this.filterPoliciesWithCondition(policies, filters, filterByService));
  }

  ngOnInit() {
    [loadPolicies, loadClusters].map(action => this.store.dispatch(action()));
  }

  ngOnDestroy() {
    this.clustersSubscription.unsubscribe();
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
