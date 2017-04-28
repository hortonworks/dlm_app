import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class PolicyService {

  constructor(private http: Http) { }

  createPolicy(policy: any): Observable<any> {
    return this.http.post('policies', policy).map(r => r.json());
  }

  fetchPolicies(): Observable<any> {
    return this.http.get('policies').map(r => r.json());
  }

  fetchPolicy(id: string): Observable<any> {
    return this.http.get(`policies/${id}`).map(r => r.json());
  }

  removePolicy(id: string): Observable<any> {
    return this.http.delete(`policies/${id}`);
  }

}
