import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { POLICY_SUBMIT_TYPES } from 'constants/policy.constant';
import { PolicyPayload } from 'models/policy.model';

@Injectable()
export class PolicyService {

  constructor(private http: Http) { }

  createPolicy(payload: { policy: PolicyPayload, targetClusterId: string }): Observable<any> {
    const { policy, targetClusterId } = payload;
    return this.http.post(`clusters/${targetClusterId}/policy/${policy.policyDefinition.name}/submit`, policy)
      .map(r => r.json());
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

  schedulePolicy(payload: { policyName: string, targetClusterId: string|number}) {
    return this.http.put(`clusters/${payload.targetClusterId}/policy/${payload.policyName}/schedule`, {})
      .map(r => r.json());
  }

}
