import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { loadPolicies } from 'actions/policy.action';
import { loadClusters } from 'actions/cluster.action';
import { loadJobsForClusters } from 'actions/job.action';
import { Policy } from 'models/policy.model';
import { DropdownItem } from 'components/dropdown/dropdown-item';
import { getPolicyClusterJob } from 'selectors/policy.selector';
import { filterCollection } from 'utils/array-util';
import * as fromRoot from 'reducers/';
import { Cluster } from 'models/cluster.model';
import { getAllClusters } from 'selectors/cluster.selector';
import { TableFilterItem } from 'common/table/table-filter/table-filter-item.type';

export const ALL = 'all';

@Component({
  selector: 'dp-main',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit, OnDestroy {
  policies$: Observable<Policy[]>;
  clusters$: Observable<Cluster[]>;
  clustersSubscription: Subscription;
  filteredPolicies$: Observable<Policy[]>;
  filters$: BehaviorSubject<any> = new BehaviorSubject({});
  filterByService$: BehaviorSubject<any> = new BehaviorSubject('');
  addOptions: DropdownItem[] = [
    {label: 'Cluster', path: '../clusters/create'},
    {label: 'Policy', path: 'create'}
  ];
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

    this.clustersSubscription = this.clusters$.subscribe(clusters => {
      const clusterIds = clusters.map(c => c.id);
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

  handleAddSelected(option: DropdownItem) {
    this.router.navigate([option.path], {relativeTo: this.route});
  }


  onFilter(filters) {
    this.filters$.next(filters);
  }

  filterPoliciesByService(type) {
    this.filterByService$.next(type);
  }
}
