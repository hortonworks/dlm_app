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
import { getAllPolicies, getPolicyClusterJob, getUnhealthyPolicies } from 'selectors/policy.selector';
import { getAllClusters, getUnhealthyClusters, getClustersWithLowCapacity } from 'selectors/cluster.selector';
import { getDisplayedEvents } from 'selectors/event.selector';
import { loadJobsForClusters } from 'actions/job.action';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { loadPolicies } from 'actions/policy.action';
import { getMergedProgress, getProgressState } from 'selectors/progress.selector';
import { POLICY_TYPES_LABELS } from 'constants/policy.constant';
import { OverviewJobsExternalFiltersService } from 'services/overview-jobs-external-filters.service';
import { Policy } from 'models/policy.model';
import { Cluster } from 'models/cluster.model';
import { Job } from 'models/job.model';
import { ClustersStatus, PoliciesStatus, JobsStatus } from 'models/aggregations.model';
import { filterCollection, flatten, unique } from 'utils/array-util';
import { isEqual } from 'utils/object-utils';
import { POLL_INTERVAL } from 'constants/api.constant';
import { getClustersHealth, getPoliciesHealth, getJobsHealth } from 'selectors/aggregation.selector';
import { SUMMARY_PANELS, CLUSTERS_HEALTH_STATE } from './resource-summary/';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { MapSizeSettings, ClusterMapData, ClusterMapPoint } from 'models/map-data';

const POLICIES_REQUEST = 'POLICIES_REQUEST';
const CLUSTERS_REQUEST = 'CLUSTERS_REQUEST';
const JOBS_REQUEST = 'JOBS_REQUEST';
const CLUSTER_STATUS_REQUEST = 'CLUSTERS_STATUS_REQUEST';

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
  CLUSTER_STATUS = CLUSTER_STATUS;
  mapSizeSettings: MapSizeSettings = {
    width: '100%',
    height: '300px',
    zoom: 2
  };
  isUnhealthyClustersModalVisible = false;
  isWarningClustersModalVisible = false;
  isUnhealthyPoliciesModalVisible = false;

  events$: Observable<Event[]>;
  jobs$: Observable<Job[]>;
  policies$: Observable<Policy[]>;
  clusters$: Observable<Cluster[]>;
  fullfilledClusters$: Observable<Cluster[]>;
  tableResources$: Observable<any>;
  overallProgress$: Observable<ProgressState>;
  tableData$: Observable<any>;
  subscriptions: Subscription[] = [];
  clustersSubscription: Subscription;
  clustersSummary$: Observable<ClustersStatus>;
  policiesSummary$: Observable<PoliciesStatus>;
  jobsSummary$: Observable<JobsStatus>;
  unhealthyClusters$: Observable<Cluster[]>;
  lowCapacityClusters$: Observable<Cluster[]>;
  unhealthyPolicies$: Observable<Policy[]>;
  clustersMapData$: Observable<ClusterMapData[]>;


  constructor(private store: Store<fromRoot.State>,
              private overviewJobsExternalFiltersService: OverviewJobsExternalFiltersService) {
    this.events$ = store.select(getDisplayedEvents);
    this.jobs$ = store.select(getAllJobs);
    this.policies$ = store.select(getAllPolicies);
    this.clusters$ = store.select(getAllClusters);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, JOBS_REQUEST, CLUSTER_STATUS_REQUEST));
    this.fullfilledClusters$ = this.clusters$
      .filter(clusters => !!clusters.length)
      .distinctUntilChanged(null, clusters => clusters.map(cluster => cluster.id).join('@') + '_LENGTH' + clusters.length);
    this.clustersSummary$ = store.select(getClustersHealth);
    this.policiesSummary$ = store.select(getPoliciesHealth);
    this.jobsSummary$ = store.select(getJobsHealth);

    this.tableResources$ = store.select(getPolicyClusterJob);
    this.unhealthyClusters$ = this.store.select(getUnhealthyClusters)
      .distinctUntilChanged(isEqual)
      .map(clusters => clusters.map(cluster => ({
        ...cluster,
        status: cluster.status.filter(service => service.state !== SERVICE_STATUS.STARTED)
      })));
    this.lowCapacityClusters$ = this.store.select(getClustersWithLowCapacity);
    this.unhealthyPolicies$ = this.store.select(getUnhealthyPolicies)
      .map(policies => policies.map(policy => ({
        ...policy,
        sourceClusterResource: {
          ...policy.sourceClusterResource,
          status: (policy.sourceClusterResource.status || []).filter(service => service.state !== SERVICE_STATUS.STARTED)
        },
        targetClusterResource: {
          ...policy.targetClusterResource,
          status: (policy.targetClusterResource.status || []).filter(service => service.state !== SERVICE_STATUS.STARTED)
        }
      })));
    this.clustersMapData$ = this.fullfilledClusters$
      .startWith([])
      .map(clusters => clusters.map(cluster => (<ClusterMapData>{start: <ClusterMapPoint>{cluster}})));
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
          loadClusters(),
          loadClustersStatuses()
        ].map(action => this.store.dispatch(action));
        this.store.dispatch(loadJobsForClusters(clusters.map(cluster => cluster.id)));
      });

    this.subscriptions.push(polling$.subscribe());
  }

  private showClusterSummaryDialog(healthStatus) {
    if (healthStatus === CLUSTERS_HEALTH_STATE.UNHEALTHY) {
      this.isUnhealthyClustersModalVisible = true;
    } else {
      this.isWarningClustersModalVisible = true;
    }
  }

  private showPoliciesSummaryDialog(healthStatus) {
    this.isUnhealthyPoliciesModalVisible = true;
  }

  private applyJobFilter(healthStatus) {
    // todo: apply filter logic
  }

  ngOnInit() {
    [
      loadPolicies(POLICIES_REQUEST),
      loadClusters(CLUSTERS_REQUEST)
    ].map(action => this.store.dispatch(action));
    const clusterSubscribtion = this.fullfilledClusters$
      .subscribe(clusters => this.store.dispatch(loadJobsForClusters(clusters.map(cluster => cluster.id), JOBS_REQUEST)));
    const overallProgressSubscription = this.overallProgress$
      .skip(1)
      .map(p => p.isInProgress)
      .distinctUntilChanged()
      .filter(isInProgress => !isInProgress)
      .subscribe(_ => this.initPolling());

    const clustersRequestSubscription = this.store.select(getProgressState(CLUSTERS_REQUEST))
      .map(p => p.isInProgress)
      .distinctUntilChanged()
      .filter(isInProgress => !isInProgress)
      .subscribe(_ => this.store.dispatch(loadClustersStatuses(CLUSTER_STATUS_REQUEST)));

    this.tableData$ = Observable
      .combineLatest(this.tableResources$, this.overviewJobsExternalFiltersService.filters$)
      .map(([policies, filters]) => policies
        .filter(policy => policy.jobsResource.some(job => job.status !== JOB_STATUS.SUCCESS))
        .filter(policy => this.filterPolicyByJob(policy, filters))
        .map(policy => this.mapTableData(policy)));

    this.subscriptions.push(clusterSubscribtion);
    this.subscriptions.push(overallProgressSubscription);
    this.subscriptions.push(clustersRequestSubscription);
  }


  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleOnSelectPanelCell(e) {
    switch (e.panel) {
      case SUMMARY_PANELS.CLUSTER:
        this.showClusterSummaryDialog(e.cell);
        break;
      case SUMMARY_PANELS.POLICIES:
        this.showPoliciesSummaryDialog(e.cell);
        break;
      case SUMMARY_PANELS.JOBS:
        this.applyJobFilter(e.cell);
        break;
      default:
        break;
    }
  }

  hideSummaryModals() {
    this.isUnhealthyClustersModalVisible = false;
    this.isWarningClustersModalVisible = false;
    this.isUnhealthyPoliciesModalVisible = false;
  }
}
