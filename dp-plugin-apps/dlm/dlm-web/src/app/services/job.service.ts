import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Policy } from 'models/policy.model';
import { mapResponse } from 'utils/http-util';

@Injectable()
export class JobService {

  constructor(private http: Http) {}

  getJobs(): Observable<any> {
    return this.http.get('jobs').map(r => r.json());
  }

  getJob(id: string): Observable<any> {
    return this.http.get(`jobs/${id}`).map(r => r.json());
  }

  getJobsForClusters(clusterIds: string[], numResults = 1000): Observable<any> {
    const requests = clusterIds.map(id => this.http.get(`clusters/${id}/jobs?numResults=${numResults}`).map(response => response.json()));
    return Observable.forkJoin(requests).map(responses =>
      responses.reduce((response, combined) => ({jobs: [...combined.jobs, ...response.jobs]}), {jobs: []}));
  }

  getJobsForPolicy(policy: Policy, numResults = 1000): Observable<any> {
    const url = `clusters/${policy.targetClusterResource.id}/policy/${policy.name}/jobs?numResults=${numResults}`;
    return this.http.get(url).map(r => r.json());
  }

  abortJob(policy: Policy): Observable<any> {
    const url = `clusters/${policy.targetClusterResource.id}/policy/${policy.name}/jobs/abort`;
    return mapResponse(this.http.put(url, {}));
  }
}
