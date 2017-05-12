import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { POLICY_SUBMIT_TYPES } from 'constants/policy.constant';
import { PolicyPayload } from 'models/policy.model';

@Injectable()
export class PolicyService {

  constructor(private http: Http) { }

  createPolicy(payload: { policy: PolicyPayload, sourceClusterId: string }): Observable<any> {
    const { policy, sourceClusterId } = payload;
    const requestUrl = `clusters/${sourceClusterId}/policy/${policy.policyDefinition.name}`;
    let request$;
    if (policy.submitType === POLICY_SUBMIT_TYPES.SUBMIT) {
      request$ = this.http.post(`${requestUrl}/submit`, policy);
    } else {
      request$ = this.http.put(`${requestUrl}/schedule`, policy);
    }
    return request$.map(r => r.json());
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
