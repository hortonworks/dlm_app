import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Policy } from 'models/policy.model';
import { mapResponse } from 'utils/http-util';
import { JOB_STATUS } from 'constants/status.constant';
import { Job } from 'models/job.model';
import { JobTrackingInfo } from 'models/job-tracking-info.model';
import * as moment from 'moment';

@Injectable()
export class JobService {

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
    return mapResponse(this.http.get('jobs')).map(response => {
      response.jobs = response.jobs.map(this.normalizeJob);
      return response;
    });
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
    const url = `clusters/${policy.targetClusterResource.id}/policy/${policy.name}/jobs?numResults=${numResults}`;
    return mapResponse(this.http.get(url)).map(response => {
      response.jobs = response.jobs.map(this.normalizeJob);
      return response;
    });
  }

  getJobsForPolicies(policies: Policy[], numResults = 1000): Observable<any> {
    const requests = policies.map(policy => this.getJobsForPolicy(policy, numResults).catch(err => Observable.of({jobs: []})));
    return Observable.forkJoin(requests).map(responses => {
      const ret = responses.reduce((response, combined) => ({jobs: [...combined.jobs, ...response.jobs]}), {jobs: []});
      return ret;
    });
  }

  abortJob(policy: Policy): Observable<any> {
    const url = `clusters/${policy.targetClusterResource.id}/policy/${policy.name}/jobs/abort`;
    return mapResponse(this.http.put(url, {}));
  }
}
