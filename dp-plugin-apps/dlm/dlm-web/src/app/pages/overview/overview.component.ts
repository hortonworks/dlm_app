import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as fromRoot from 'reducers/';
import { Job } from 'models/job.model';
import { Event } from 'models/event.model';
import { ProgressState } from 'models/progress-state.model';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { getAllJobs } from 'selectors/job.selector';
import { getAllPolicies } from 'selectors/policy.selector';
import { getAllClusters } from 'selectors/cluster.selector';
import { getAllEvents } from 'selectors/event.selector';
import { loadJobsForClusters } from 'actions/job.action';
import { loadClusters } from 'actions/cluster.action';
import { loadPolicies } from 'actions/policy.action';
import { getMergedProgress } from 'selectors/progress.selector';
import { ResourceChartData } from './resource-charts/';

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
    policies: [POLICY_STATUS.SUBMITTED, POLICY_STATUS.WARNING, POLICY_STATUS.FAILED],
    jobs: [JOB_STATUS.SUCCESS, JOB_STATUS.IN_PROGRESS, JOB_STATUS.WARNINGS, JOB_STATUS.FAILED]
  };
  jobs$: Observable<Job[]>;
  events$: Observable<Event[]>;
  clustersSubscrition: Subscription;
  overallProgress$: Observable<ProgressState>;
  resourceChartData$: Observable<ResourceChartData>;

  constructor(private store: Store<fromRoot.State>) {
    this.jobs$ = store.select(getAllJobs);
    this.events$ = store.select(getAllEvents);
    const policies$ = store.select(getAllPolicies);
    const clusters$ = store.select(getAllClusters);
    this.overallProgress$ = store.select(getMergedProgress(POLICIES_REQUEST, CLUSTERS_REQUEST, JOBS_REQUEST));
    this.clustersSubscrition = clusters$
      .filter(clusters => !!clusters.length)
      .distinctUntilChanged(null, clusters => {
        return clusters.map(cluster => cluster.id).join('@') + '_LENGTH' + clusters.length;
      })
      .subscribe((clusters) => {
        store.dispatch(loadJobsForClusters(clusters.map(cluster => cluster.id), JOBS_REQUEST));
      });
    this.resourceChartData$ = Observable.combineLatest(this.jobs$, policies$, clusters$)
      .map(this.mapResourceData);
  }

  mapResourceData = ([jobs, policies, clusters]): ResourceChartData => {
    return {
      clusters: { data: [clusters.length], labels: ['Registered'] },
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

  ngOnInit() {
    [
      loadPolicies(POLICIES_REQUEST),
      loadClusters(CLUSTERS_REQUEST)
    ].map(action => this.store.dispatch(action));
  }

  ngOnDestroy() {
    this.clustersSubscrition.unsubscribe();
  }
}
