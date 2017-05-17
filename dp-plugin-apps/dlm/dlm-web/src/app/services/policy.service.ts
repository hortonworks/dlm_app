import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { PolicyPayload } from 'models/policy.model';
import { mapResponse } from 'utils/http-util';

@Injectable()
export class PolicyService {

  constructor(private http: Http) { }

  createPolicy(payload: { policy: PolicyPayload, targetClusterId: string }): Observable<any> {
    const { policy, targetClusterId } = payload;
    return mapResponse(this.http.post(`clusters/${targetClusterId}/policy/${policy.policyDefinition.name}/submit`, policy));
  }

  fetchPolicies(): Observable<any> {
    return mapResponse(this.http.get('policies'));
  }

  fetchPolicy(id: string): Observable<any> {
    return mapResponse(this.http.get(`policies/${id}`));
  }

  removePolicy(id: string): Observable<any> {
    return this.http.delete(`policies/${id}`);
  }

  schedulePolicy(payload: { policyName: string, targetClusterId: string|number}) {
    return mapResponse(this.http.put(`clusters/${payload.targetClusterId}/policy/${payload.policyName}/schedule`, {}));
  }

}
