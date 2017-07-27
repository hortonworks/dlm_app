import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Policy, PolicyPayload } from 'models/policy.model';
import { mapResponse } from 'utils/http-util';
import { JobService } from 'services/job.service';

@Injectable()
export class PolicyService {

  static makeClusterId(datacenter, clusterName): string {
    return datacenter + '$' + clusterName;
  }

  static getClusterName(policyClusterId): string {
    return policyClusterId.split('$')[1];
  }

  normalizePolicy(policy): Policy {
    policy.id = policy.policyId;
    if (policy.endTime.indexOf('9999') === 0) {
      policy.endTime = null;
    }
    return policy;
  }

  constructor(private http: Http, private jobService: JobService) { }

  createPolicy(payload: { policy: PolicyPayload, targetClusterId: string }): Observable<any> {
    const { policy, targetClusterId } = payload;
    return mapResponse(this.http.post(`clusters/${targetClusterId}/policy/${policy.policyDefinition.name}/submit`, policy));
  }

  fetchPolicies(): Observable<any> {
    return mapResponse(this.http.get('policies')).map(response => {
      response.policies.forEach(policy => {
        policy.jobs = policy.jobs.map(job => this.jobService.normalizeJob(job));
        policy = {
          ...policy,
          ...this.normalizePolicy(policy)
        };
      });
      return response;
    });
  }

  fetchPolicy(id: string): Observable<any> {
    return mapResponse(this.http.get(`policies/${id}`));
  }

  schedulePolicy(payload: { policyName: string, targetClusterId: string|number}) {
    return mapResponse(this.http.put(`clusters/${payload.targetClusterId}/policy/${payload.policyName}/schedule`, {}));
  }

  private getManagePolicyUrl(policy: Policy): string {
    return `clusters/${policy.targetClusterResource.id}/policy/${policy.name}`;
  }

  deletePolicy(payload: Policy): Observable<any> {
    return this.http.delete(this.getManagePolicyUrl(payload))
      .map(r => r.json());
  }

  suspendPolicy(payload: Policy): Observable<any> {
    return this.http.put(`${this.getManagePolicyUrl(payload)}/suspend`, payload)
      .map(r => r.json());
  }

  resumePolicy(payload: Policy): Observable<any> {
    return this.http.put(`${this.getManagePolicyUrl(payload)}/resume`, payload)
      .map(r => r.json());
  }

}
