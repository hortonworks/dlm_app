/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

import { Policy } from 'models/policy.model';
import { JOB_STATUS } from 'constants/status.constant';
import { Job } from 'models/job.model';
import { JobTrackingInfo } from 'models/job-tracking-info.model';

@Injectable()
export class JobService {

  private getUrlForJobs(policy: Policy) {
    return `clusters/${policy.targetClusterResource.id}/policy/${policy.name}/jobs`;
  }

  private doJobsRequest(url) {
    return this.httpClient.get<any>(url).map(response => {
      response.jobs = response.jobs.map(this.normalizeJob);
      return response;
    });
  }

  normalizeJob(job): Job {
    const duration = job.endTime && job.startTime ?
      moment(job.endTime).diff(moment(job.startTime)) : -1;
    let trackingInfo: JobTrackingInfo;
    try {
      trackingInfo = JSON.parse(job.trackingInfo) as JobTrackingInfo;
    } catch (e) {
      trackingInfo = {} as JobTrackingInfo;
    }
    return {
      ...job,
      duration: duration >= 0 ? duration : -1,
      isCompleted: job.status !== JOB_STATUS.RUNNING,
      trackingInfo
    };
  }

  constructor(private httpClient: HttpClient) {}

  getJobs(): Observable<any> {
    return this.doJobsRequest('jobs');
  }

  getJob(id: string): Observable<any> {
    return this.httpClient.get<any>(`jobs/${id}`);
  }

  getJobsForClusters(clusterIds: string[], numResults = 1000): Observable<any> {
    const requests = clusterIds.map(id =>
      this.httpClient.get<any>(`clusters/${id}/jobs?numResults=${numResults}`));
    return Observable.forkJoin(requests).map(responses =>
      responses.reduce((allJobs, response) => ({ jobs: [...allJobs.jobs, ...response.jobs.map(this.normalizeJob)] }), { jobs: [] }));
  }

  getJobsForPolicy(policy: Policy, numResults = 1000): Observable<any> {
    const url = `${this.getUrlForJobs(policy)}?numResults=${numResults}`;
    return this.doJobsRequest(url);
  }

  getJobsForPolicies(policies: Policy[], numResults = 1000): Observable<any> {
    const requests = policies.map(policy => this.getJobsForPolicy(policy, numResults).catch(err => Observable.of({jobs: []})));
    return Observable.forkJoin(requests).map(responses => {
      return responses.reduce((response, combined) => ({jobs: [...combined.jobs, ...response.jobs]}), {jobs: []});
    });
  }

  getJobsForPolicyServerPaginated(policy: Policy, offset, sortBy = [], pageSize = 10, filters: any = []): Observable<any> {
    const orderBy = sortBy[0] ? sortBy[0].prop : 'startTime';
    const sortOrder = sortBy[0] ? sortBy[0].dir.toUpperCase() : 'DESC';
    const filterBy = filters.filter(f => !Array.isArray(f.value) && f.value || Array.isArray(f.value) && f.value.length).map(f => {
      const prop = f.propertyName;
      const value = Array.isArray(f.value) ? f.value.join('|') : f.value;
      return `${prop}:${value}`;
    }).join(',');
    let qp = `numResults=${pageSize}&offset=${offset * pageSize}&orderBy=${orderBy}&sortOrder=${sortOrder}`;
    if (filterBy) {
      qp += `&filterBy=${filterBy}`;
    }
    const url = `${this.getUrlForJobs(policy)}?${qp}`;
    return this.doJobsRequest(url);
  }

  abortJob(policy: Policy): Observable<any> {
    const url = `${this.getUrlForJobs(policy)}/abort`;
    return this.httpClient.put(url, {});
  }

  rerunJob(policy: Policy): Observable<any> {
    const url = `${this.getUrlForJobs(policy)}/rerun`;
    return this.httpClient.post(url, {});
  }
}
