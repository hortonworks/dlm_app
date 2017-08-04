import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';

import * as fromRoot from 'reducers/';
import { Event } from 'models/event.model';
import { JOB_EVENT, POLICY_EVENT } from 'constants/event.constant';
import { ProgressState } from 'models/progress-state.model';
import { updateProgressState } from 'actions/progress.action';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { getAllJobs } from 'selectors/job.selector';
import {
  getPolicyClusterJob, getUnhealthyPolicies, getAllPoliciesWithClusters, getCountPoliciesForSourceClusters
} from 'selectors/policy.selector';
import { getAllClusters, getUnhealthyClusters, getClustersWithLowCapacity } from 'selectors/cluster.selector';
import { getDisplayedEvents } from 'selectors/event.selector';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { loadPolicies, loadLastJobs } from 'actions/policy.action';
import { getMergedProgress, getProgressState } from 'selectors/progress.selector';
import { POLICY_TYPES_LABELS } from 'constants/policy.constant';
import { OverviewJobsExternalFiltersService } from 'services/overview-jobs-external-filters.service';
import { Policy } from 'models/policy.model';
import { Cluster } from 'models/cluster.model';
import { Job } from 'models/job.model';
import { ClustersStatus, PoliciesStatus, JobsStatus } from 'models/aggregations.model';
import { filterCollection, flatten, unique } from 'utils/array-util';
import { isEqual, isEmpty } from 'utils/object-utils';
import { getEventEntityName } from 'utils/event-utils';
import { POLL_INTERVAL } from 'constants/api.constant';
import { getClustersHealth, getPoliciesHealth, getJobsHealth } from 'selectors/aggregation.selector';
import { SUMMARY_PANELS, CLUSTERS_HEALTH_STATE, JOBS_HEALTH_STATE } from './resource-summary/';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { MapSizeSettings, ClusterMapData, ClusterMapPoint } from 'models/map-data';
import { LogService } from 'services/log.service';
import { EntityType, LOG_EVENT_TYPE_MAP } from 'constants/log.constant';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { getCountPairsForClusters } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { AddEntityButtonComponent } from 'components/add-entity-button/add-entity-button.component';
import { TranslateService } from '@ngx-translate/core';

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
  CLUSTER_STATUS = CLUSTER_STATUS;
  mapSizeSettings: MapSizeSettings = {
    width: '100%',
    height: '300px',
    zoom: 2
  };
  isUnhealthyClustersModalVisible = false;
  isWarningClustersModalVisible = false;
  isUnhealthyPoliciesModalVisible = false;

  addingPairsAvailable = AddEntityButtonComponent.addingPairingsAvailable;
  addingPoliciesAvailable = AddEntityButtonComponent.addingPoliciesAvailable;

  events$: Observable<Event[]>;
  policies$: Observable<Policy[]>;
  clusters$: Observable<Cluster[]>;
  fullfilledClusters$: Observable<Cluster[]>;
  tableResources$: Observable<any>;
  overallProgress$: Observable<ProgressState>;
  tableData$: Observable<any>;
  pairsCount$: Observable<PairsCountEntity[]>;
  subscriptions: Subscription[] = [];
  clustersSubscription: Subscription;
  clustersSummary$: Observable<ClustersStatus>;
  policiesSummary$: Observable<PoliciesStatus>;
  jobsSummary$: Observable<JobsStatus>;
  unhealthyClusters$: Observable<Cluster[]>;
  lowCapacityClusters$: Observable<Cluster[]>;
  unhealthyPolicies$: Observable<Policy[]>;
  clustersMapData$: Observable<ClusterMapData[]>;
  selectedCluster$ = new BehaviorSubject<null|Cluster>(null);
  clusterLegend$: Observable<any>;

  jobStatusFilter$ = new BehaviorSubject('');
  areJobsLoaded = false;

  constructor(private store: Store<fromRoot.State>,
              private overviewJobsExternalFiltersService: OverviewJobsExternalFiltersService,
              private logService: LogService,
              private router: Router,
              private t: TranslateService) {
    this.events$ = store.select(getDisplayedEvents);
    this.policies$ = store.select(getAllPoliciesWithClusters);
    this.clusters$ = store.select(getAllClusters);
    this.pairsCount$ = store.select(getCountPairsForClusters);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, JOBS_REQUEST));
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
    this.clustersMapData$ = Observable
      .combineLatest(this.clusters$, store.select(getCountPoliciesForSourceClusters), this.lowCapacityClusters$)
      .startWith([[], [], []])
      .map(([clusters, policiesCount, lowCapacityClusters]) => this.makeClustersMapData(clusters, policiesCount, lowCapacityClusters));
    this.clusterLegend$ = Observable
      .combineLatest(this.clustersMapData$, this.selectedCluster$, this.policies$)
      .map(([clustersMapData, selectedCluster, policies]) => {
        if (!selectedCluster) {
          return false;
        }
        const cluster = clustersMapData.find(c => c.start.cluster.id === selectedCluster.id).start.cluster;
        return {
          ...cluster,
          alerts: cluster.status.filter(service => service.state !== SERVICE_STATUS.STARTED)
        };
      });
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
    this.jobStatusFilter$.next(healthStatus);
  }

  private completedRequest$(progress$: Observable<ProgressState>): Observable<boolean> {
    return progress$
      .skip(1)
      .map(p => p.isInProgress)
      .distinctUntilChanged()
      .filter(isInProgress => !isInProgress);
  }

  private matchJobStatus(policy: Policy, jobStatusFilter) {
    switch (jobStatusFilter) {
      case JOBS_HEALTH_STATE.IN_PROGRESS:
        return policy.lastJobResource.status === JOB_STATUS.RUNNING;
      case JOBS_HEALTH_STATE.LAST_FAILED:
        return policy.lastJobResource.status === JOB_STATUS.FAILED;
      case JOBS_HEALTH_STATE.LAST_10_FAILED:
        return policy.lastTenJobs.some(job => job.status === JOB_STATUS.FAILED);
      default:
        return true;
    }
  }

  private makeClustersMapData(clusters, policiesCount, lowCapacityClusters) {
    return clusters.map(cluster => {
      const policiesCounter = cluster.id in policiesCount &&
        'policies' in policiesCount[cluster.id] ? policiesCount[cluster.id].policies : 0;
      // prioritize UNHEALTHY status over WARNING when display cluster dot marker
      const healthStatus = lowCapacityClusters.some(c => c.id === cluster.id) && cluster.healthStatus !== CLUSTER_STATUS.UNHEALTHY ?
        CLUSTER_STATUS.WARNING : cluster.healthStatus;
      const clusterData = {
        ...cluster,
        healthStatus,
        policiesCounter
      };
      return <ClusterMapData>{start: <ClusterMapPoint>{cluster: clusterData}};
    });
  }

  ngOnInit() {
    [
      loadPolicies(POLICIES_REQUEST),
      loadClusters(CLUSTERS_REQUEST),
      loadPairings()
    ].map(action => this.store.dispatch(action));
    const overallProgressSubscription = this.completedRequest$(this.overallProgress$)
      .take(1)
      .do(_ => this.initPolling())
      .subscribe();
    const clusterPoliciesCompleteSubscription = Observable.combineLatest(
      this.completedRequest$(this.store.select(getProgressState(CLUSTERS_REQUEST))),
      this.completedRequest$(this.store.select(getProgressState(POLICIES_REQUEST)))
    ).switchMap(_ => this.policies$)
      .subscribe(policies => {
        if (this.areJobsLoaded) {
          return;
        }
        if (!policies.length) {
          this.areJobsLoaded = true;
          this.store.dispatch(updateProgressState(JOBS_REQUEST, { isInProgress: false }));
        } else {
          if (policies.some(policy => !isEmpty(policy.sourceClusterResource))) {
            this.areJobsLoaded = true;
            this.store.dispatch(loadLastJobs({policies, numJobs: 10}, {requestId: JOBS_REQUEST}));
          }
        }
    });
    this.tableData$ = Observable
      .combineLatest(this.tableResources$, this.jobStatusFilter$)
      .map(([policies, jobStatusFilter]) => policies
      .filter(policy => policy.jobsResource.some(job => job.status !== JOB_STATUS.SUCCESS) &&
        this.matchJobStatus(policy, jobStatusFilter))
      .map(policy => this.mapTableData(policy)));

    this.subscriptions.push(overallProgressSubscription);
    this.subscriptions.push(clusterPoliciesCompleteSubscription);
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

  handleOnShowPolicyLog(policy) {
    this.logService.showLog(EntityType.policyinstance, policy.lastJobResource.id);
  }

  formatStatusFilter(jobStatusFilter) {
    return {
      [JOBS_HEALTH_STATE.IN_PROGRESS]: this.t.instant('page.overview.summary_panels.status.in_progress'),
      [JOBS_HEALTH_STATE.LAST_FAILED]: this.t.instant('page.overview.summary_panels.status.failed_last'),
      [JOBS_HEALTH_STATE.LAST_10_FAILED]: this.t.instant('page.overview.summary_panels.status.failed_last_10')
    }[jobStatusFilter];
  }

  removeJobStatusFilter() {
    this.applyJobFilter('');
  }

  handleClickMarker(cluster: Cluster) {
    this.selectedCluster$.next(cluster);
  }

  showEventEntityLogs(event: Event) {
    const entityType = JOB_EVENT === event.eventType ? EntityType.policyinstance : EntityType.policy;
    this.logService.showLog(entityType, event[LOG_EVENT_TYPE_MAP[entityType]]);
  }

  goToPolicy(event: Event) {
    this.router.navigate(['/policies'], {queryParams: {policy: getEventEntityName(event)}});
  }
}
