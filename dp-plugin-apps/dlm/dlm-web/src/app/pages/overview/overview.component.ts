import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import * as fromRoot from 'reducers/';
import { Event } from 'models/event.model';
import { ProgressState } from 'models/progress-state.model';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { getAllJobs } from 'selectors/job.selector';
import { getAllPolicies, getPolicyClusterJob } from 'selectors/policy.selector';
import { getAllClusters } from 'selectors/cluster.selector';
import { getDisplayedEvents } from 'selectors/event.selector';
import { loadJobsForClusters } from 'actions/job.action';
import { loadClusters } from 'actions/cluster.action';
import { loadPolicies } from 'actions/policy.action';
import { getMergedProgress } from 'selectors/progress.selector';
import { ResourceChartData } from './resource-charts/';
import { POLICY_TYPES_LABELS } from 'constants/policy.constant';
import { OverviewJobsExternalFiltersService } from 'services/overview-jobs-external-filters.service';
import { Policy } from 'models/policy.model';
import { Cluster } from 'models/cluster.model';
import { Job } from 'models/job.model';
import { filterCollection, flatten, unique } from 'utils/array-util';
import { isEqual } from 'utils/object-utils';
import { POLL_INTERVAL } from 'constants/api.constant';

const POLICIES_REQUEST = 'POLICIES_REQUEST';
const CLUSTERS_REQUEST = 'CLUSTERS_REQUEST';
const JOBS_REQUEST = 'JOBS_REQUEST';

@Component({
  selector: 'dlm-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent implements OnInit, OnDestroy {
  private resourceStatusMap = {
    // TODO where to get statuses for clusters?
    policies: [POLICY_STATUS.RUNNING, POLICY_STATUS.SUBMITTED, POLICY_STATUS.SUSPENDED],
    jobs: [JOB_STATUS.SUCCESS, JOB_STATUS.WARNINGS, JOB_STATUS.FAILED, JOB_STATUS.RUNNING]
  };
  events$: Observable<Event[]>;
  jobs$: Observable<Job[]>;
  policies$: Observable<Policy[]>;
  clusters$: Observable<Cluster[]>;
  fullfilledClusters$: Observable<Cluster[]>;
  tableResources$: Observable<any>;
  overallProgress$: Observable<ProgressState>;
  resourceChartData$: Observable<ResourceChartData>;
  tableData$: Observable<any>;
  subscriptions: Subscription[] = [];
  clustersSubscription: Subscription;

  constructor(private store: Store<fromRoot.State>,
              private overviewJobsExternalFiltersService: OverviewJobsExternalFiltersService) {
    this.events$ = store.select(getDisplayedEvents);
    this.jobs$ = store.select(getAllJobs);
    this.policies$ = store.select(getAllPolicies);
    this.clusters$ = store.select(getAllClusters);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, JOBS_REQUEST));
    this.fullfilledClusters$ = this.clusters$
      .filter(clusters => !!clusters.length)
      .distinctUntilChanged(null, clusters => clusters.map(cluster => cluster.id).join('@') + '_LENGTH' + clusters.length);
    this.tableResources$ = store.select(getPolicyClusterJob);
  }

  prepareChartData(jobs: Job[], policies: Policy[], clusters: Cluster[], filters) {
    const filteredPolicies = policies
      .filter(policy => policy.jobsResource.some(job => job.status !== JOB_STATUS.SUCCESS))
      .filter(policy => this.filterPolicyByJob(policy, filters));
    const filteredPolicyNames = filteredPolicies.map(p => p.name);
    const filteredJobs = filterCollection(jobs, {name: filteredPolicyNames});
    const clusterNamesByPolicies = unique(flatten(filteredPolicies.map(p => [p.targetCluster, p.sourceCluster])));
    const filteredClusters = filterCollection(clusters, {name: clusterNamesByPolicies});
    return this.mapResourceData(filteredJobs, filteredPolicies, filteredClusters);
  }

  mapResourceData(jobs: Job[], policies: Policy[], clusters: Cluster[]): ResourceChartData {
    return {
      clusters: {data: [clusters.length], labels: ['Registered']},
      policies: this.makeResourceData('policies', policies),
      jobs: this.makeResourceData('jobs', jobs)
    };
  }

  makeResourceData(resourceName: string, resourceData: any) {
    const statuses = this.resourceStatusMap[resourceName];
    const countStatus = (resources, status) => resources.filter(resource => resource.status === status).length;
    return {
      data: statuses.map(countStatus.bind(this, resourceData)),
      labels: statuses
    };
  }

  mapTableData(policy: Policy) {
    const job = policy.lastJobResource;
    return {
      ...policy,
      service: job ? POLICY_TYPES_LABELS[job.executionType] : ''
    };
  }

  filterPolicyByJob(policy: Policy, filters) {
    const {lastJobResource: job} = policy;
    if (!job || !filters.timeRange) {
      return true;
    }
    const timestamp = moment().subtract(1, filters.timeRange.toLowerCase()).unix() * 1000;
    return !job.endTime ? true : new Date(job.endTime).getTime() > timestamp;
  }

  private initPolling() {
    const polling$ = Observable.interval(POLL_INTERVAL)
      .withLatestFrom(this.fullfilledClusters$)
      .do(([_, clusters]) => {
        [
          loadPolicies(),
          loadClusters()
        ].map(action => this.store.dispatch(action));
        this.store.dispatch(loadJobsForClusters(clusters.map(cluster => cluster.id)));
      });

    this.subscriptions.push(polling$.subscribe());
  }

  ngOnInit() {
    const clusterSubscribtion = this.fullfilledClusters$
      .subscribe(clusters => this.store.dispatch(loadJobsForClusters(clusters.map(cluster => cluster.id), JOBS_REQUEST)));

    this.resourceChartData$ = Observable
      .combineLatest(this.jobs$, this.tableResources$, this.clusters$, this.overviewJobsExternalFiltersService.filters$)
      .map(([jobs, policies, clusters, filters]) => this.prepareChartData(jobs, policies, clusters, filters))
      .distinctUntilChanged(isEqual);

    this.tableData$ = Observable
      .combineLatest(this.tableResources$, this.overviewJobsExternalFiltersService.filters$)
      .map(([policies, filters]) => policies
        .filter(policy => policy.jobsResource.some(job => job.status !== JOB_STATUS.SUCCESS))
        .filter(policy => this.filterPolicyByJob(policy, filters))
        .map(policy => this.mapTableData(policy)));

    [
      loadPolicies(POLICIES_REQUEST),
      loadClusters(CLUSTERS_REQUEST)
    ].map(action => this.store.dispatch(action));
    this.subscriptions.push(clusterSubscribtion);
    this.initPolling();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
