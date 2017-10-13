/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Policy, PolicyPayload } from 'models/policy.model';
import { toSearchParams, mapResponse } from 'utils/http-util';
import { JobService } from 'services/job.service';
import { POLICY_DISPLAY_STATUS } from 'constants/status.constant';

@Injectable()
export class PolicyService {

  static makeClusterId(datacenter, clusterName): string {
    return datacenter + '$' + clusterName;
  }

  static getDatacenterName(policyClusterName): string {
    const clusterSplit = policyClusterName.split('$');
    return clusterSplit.length > 0 ? clusterSplit[0] : '';
  }

  static getClusterName(policyClusterName): string {
    const clusterSplit = policyClusterName.split('$');
    return clusterSplit.length > 1 ? clusterSplit[1] : '';
  }

  normalizePolicy(policy): Policy {
    policy.id = policy.policyId;
    if (policy.endTime.indexOf('9999') === 0) {
      policy.endTime = null;
    }
    policy.displayStatus = this.t.instant(POLICY_DISPLAY_STATUS[policy.status] || policy.status);
    return policy;
  }

  constructor(private http: Http, private jobService: JobService, private t: TranslateService) { }

  createPolicy(payload: { policy: PolicyPayload, targetClusterId: string }): Observable<any> {
    const { policy, targetClusterId } = payload;
    return mapResponse(this.http.post(`clusters/${targetClusterId}/policy/${policy.policyDefinition.name}/submit`, policy));
  }

  fetchPolicies(queryParams = {}): Observable<any> {
    const search = toSearchParams(queryParams);
    return mapResponse(this.http.get('policies', {search})).map(response => {
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
    return this.http.put(`${this.getManagePolicyUrl(payload)}/suspend`, {})
      .map(r => r.json());
  }

  resumePolicy(payload: Policy): Observable<any> {
    return this.http.put(`${this.getManagePolicyUrl(payload)}/resume`, {})
      .map(r => r.json());
  }

}
