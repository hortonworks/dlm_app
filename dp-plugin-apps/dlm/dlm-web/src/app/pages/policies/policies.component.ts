import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { loadPolicies } from 'actions/policy.action';
import { loadClusters } from 'actions/cluster.action';
import { loadJobs } from 'actions/job.action';
import { Policy } from 'models/policy.model';
import { DropdownItem } from 'components/dropdown/dropdown-item';
import { getPolicyClusterJob, getAllPolicies } from 'selectors/policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { flatten, unique } from 'utils/array-util';
import * as fromRoot from 'reducers/';

export const ALL = 'all';

@Component({
  selector: 'dp-main',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit, OnDestroy {
  policies$: Observable<Policy[]>;
  filterSubscription: Subscription;
  searchSubscripiton: Subscription;
  filteredPolicies$: Observable<Policy[]>;
  initialFilterValue = {
    tags: 'all',
    groups: 'all'
  };
  filterConditionUpdate$ = new BehaviorSubject(this.initialFilterValue);
  initialSearchValue = '';
  searchUpdate$ = new BehaviorSubject(this.initialSearchValue);
  tagItems: DropdownItem[] = [
    {label: this.t.instant('common.all'), name: ALL}
  ];
  groupItems = [
    {label: this.t.instant('common.all'), name: ALL}
  ];
  addOptions: DropdownItem[] = [
    { label: 'Cluster', path: '../clusters/create' },
    { label: 'Policy', path: 'create' }
  ];

  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute,
    private t: TranslateService
  ) {
    this.policies$ = this.store.select(getPolicyClusterJob)
      .map(this.prepareTableData);
    this.filteredPolicies$ = Observable.combineLatest(
      this.policies$, this.filterConditionUpdate$, this.searchUpdate$
    ).map(([policies, filterCondition, searchValue]) => {
      const filtered = this.filterPoliciesWithCondition(policies, filterCondition);
      return this.searchPolicies(filtered, searchValue);
    });
    this.filterSubscription = this.policies$.map(this.fillFilterValues).subscribe();
    this.searchSubscripiton = this.searchUpdate$.subscribe();
  }

  ngOnInit() {
    [
      loadPolicies,
      loadClusters,
      loadJobs
    ].map(action => this.store.dispatch(action()));
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
    this.searchSubscripiton.unsubscribe();
  }

  prepareTableData(policies) {
    return policies.map(policy => {
      return {
        ...policy,
        lastJobResource: policy.jobsResource.sort((a, b) => a.startTime > b.startTime)[0]
      };
    });
  }

  isContainsTag(policy, tag) {
    if (tag === ALL) {
      return true;
    }
    return policy.tags.indexOf(tag) > -1;
  }

  // todo: implement this when groups will be available
  isContainsGroup(policy, group) {
    if (group === ALL) {
      return true;
    }
  }

  filterPoliciesWithCondition(policies, filterCondition) {
    return policies.filter(policy => {
      return this.isContainsTag(policy, filterCondition.tags) &&
        this.isContainsGroup(policy, filterCondition.groups);
    });
  }

  searchPolicies(policies, value) {
    const fields = ['name', 'targetclusters', 'sourceclusters'];
    let reg;
    try {
      reg = new RegExp(value, 'i');
    } catch (e) {
      reg = new RegExp('');
    }
    return policies.filter(policy => fields.some(field => reg.test(JSON.stringify(policy[field]))));
  }

  fillFilterValues = (policies) => {
    if (this.tagItems.length > 1) {
      return;
    }
    const tagItems = unique(flatten(policies.map(policy => policy.tags)))
      .map(tag => ({label: tag, name: tag}));
    this.tagItems = [...this.tagItems, ...tagItems];
  }

  handleAddSelected(option: DropdownItem) {
    this.router.navigate([option.path], {relativeTo: this.route});
  }

  handleSelectFilter(filterType, filterValue) {
    this.filterConditionUpdate$.next({
      ...this.initialFilterValue,
      [filterType]: filterValue.name
    });
  }

  handleSearchChange(value) {
    this.searchUpdate$.next(value);
  }
}
