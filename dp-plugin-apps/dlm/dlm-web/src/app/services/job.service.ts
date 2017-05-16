import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class JobService {

  constructor(private http: Http) { }

  getJobs(): Observable<any> {
    return this.http.get('jobs').map(r => r.json());
  }

  getJob(id: string): Observable<any> {
    return this.http.get(`jobs/${id}`).map(r => r.json());
  }

  getJobsForClusters(clusterIds: string[]): Observable<any> {
    const requests = clusterIds.map(id => this.http.get(`clusters/${id}/jobs?filterBy=type:fs`).map(response => response.json()));
    return Observable.forkJoin(requests).map(responses =>
      responses.reduce((response, combined) => ({jobs: [...combined.jobs, ...response.jobs]}), {jobs: []}));
  }

}
