import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class LogService {

  constructor(private http: Http) {}

  getLogs(clusterId, instanceId): Observable<any> {
    return this.http.get(`clusters/${clusterId}/logs?filterBy=instanceId:${instanceId}`).map(r => r.json());
  }
}
