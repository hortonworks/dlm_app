import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from 'reducers/';
import { Job } from 'models/job.model';
import { getAllJobs } from 'selectors/job.selector';
import { getAllPolicies } from 'selectors/policy.selector';
import { getAllClusters } from 'selectors/cluster.selector';
import { loadJobs } from 'actions/job.action';
import { loadClusters } from 'actions/cluster.action';
import { loadPolicies } from 'actions/policy.action';
import { ResourceChartData } from './resource-charts/';

@Component({
  selector: 'dlm-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  private resourceStatusMap = {
    // TODO where to get statuses for clusters?
    policies: ['SUBMITTED', 'WARNING', 'FAILED'],
    jobs: ['In Progress', 'Warnings', 'Failed']
  };
  jobs$: Observable<Job[]>;
  resourceChartData$: Observable<ResourceChartData>;

  constructor(private store: Store<fromRoot.State>) {
    this.jobs$ = store.select(getAllJobs);
    const policies$ = store.select(getAllPolicies);
    const clusters$ = store.select(getAllClusters);
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
      loadPolicies,
      loadClusters,
      loadJobs
    ].map(action => this.store.dispatch(action()));
  }

}
