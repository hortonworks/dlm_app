/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

import { Policy } from 'models/policy.model';
import { JOB_STATUS } from 'constants/status.constant';
import { Job } from 'models/job.model';
import { JobTrackingInfo } from 'models/job-tracking-info.model';
import { omitEmpty } from 'utils/object-utils';
import { toSearchParams } from 'utils/http-util';

@Injectable()
export class JobService {

  private getUrlForJobs(policy: Policy) {
    return `clusters/${policy.clusterResourceForRequests.id}/policy/${policy.name}/jobs`;
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
    const qp = toSearchParams(omitEmpty({
      numResults: pageSize,
      offset: offset * pageSize,
      orderBy,
      sortOrder,
      filterBy
    })).toString();
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
