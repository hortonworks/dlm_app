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
}
