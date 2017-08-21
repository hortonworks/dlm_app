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
import { Http } from '@angular/http';
import { Policy } from 'models/policy.model';
import { mapResponse } from 'utils/http-util';
import { JOB_STATUS } from 'constants/status.constant';
import { Job } from 'models/job.model';
import { JobTrackingInfo } from 'models/job-tracking-info.model';

@Injectable()
export class JobService {

  private getUrlForJobs(policy: Policy) {
    return `clusters/${policy.targetClusterResource.id}/policy/${policy.name}/jobs`;
  }

  private doJobsRequest(url) {
    return mapResponse(this.http.get(url)).map(response => {
      response.jobs = response.jobs.map(this.normalizeJob);
      return response;
    });
  }

  normalizeJob(job): Job {
    job.isCompleted = job.status !== JOB_STATUS.RUNNING;
    try {
      job.trackingInfo = <JobTrackingInfo>JSON.parse(job.trackingInfo);
    } catch (e) {
      job.trackingInfo = {};
    }
    job.duration = job.trackingInfo.timeTaken;
    return job;
  }

  constructor(private http: Http) {}

  getJobs(): Observable<any> {
    return this.doJobsRequest('jobs');
  }

  getJob(id: string): Observable<any> {
    return this.http.get(`jobs/${id}`).map(r => r.json());
  }

  getJobsForClusters(clusterIds: string[], numResults = 1000): Observable<any> {
    const requests = clusterIds.map(id => this.http.get(`clusters/${id}/jobs?numResults=${numResults}`).map(response => response.json()));
    return Observable.forkJoin(requests).map(responses =>
      responses.reduce((response, combined) => ({jobs: [...combined.jobs, ...response.jobs.map(this.normalizeJob)]}), {jobs: []}));
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

  getJobsForPolicyServerPaginated(policy: Policy, offset, pageSize = 10): Observable<any> {
    const url = `${this.getUrlForJobs(policy)}?numResults=${pageSize}&offset=${offset * pageSize}&orderBy=startTime&sortOrder=DESC`;
    return this.doJobsRequest(url);
  }

  abortJob(policy: Policy): Observable<any> {
    const url = `${this.getUrlForJobs(policy)}/abort`;
    return mapResponse(this.http.put(url, {}));
  }

  rerunJob(policy: Policy): Observable<any> {
    const url = `${this.getUrlForJobs(policy)}/rerun`;
    return mapResponse(this.http.post(url, {}));
  }
}
