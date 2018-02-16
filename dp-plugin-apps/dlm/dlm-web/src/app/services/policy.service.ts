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
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import {Policy, PolicyPayload, Report} from 'models/policy.model';
import { toSearchParams } from 'utils/http-util';
import { JobService } from 'services/job.service';
import { POLICY_DISPLAY_STATUS, POLICY_STATUS, POLICY_UI_STATUS } from 'constants/status.constant';

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
    const uiStatus = this.getUIStatus(policy.status);
    const lastSucceededInstance = policy.report.lastSucceededInstance;
    policy.id = policy.policyId;
    policy.endTime = policy.endTime.indexOf('9999') === 0 ? null : policy.endTime;
    policy.uiStatus = uiStatus;
    policy.displayStatus = this.getDisplayStatus(uiStatus);
    if (lastSucceededInstance) {
      policy.lastSucceededJobTime =  lastSucceededInstance.endTime;
    }
    return policy;
  }

  private getUIStatus(status: string): string {
    const statusToUIStatus = {
      [POLICY_STATUS.RUNNING]: POLICY_UI_STATUS.ACTIVE,
      [POLICY_STATUS.SUSPENDED]: POLICY_UI_STATUS.SUSPENDED
    };
    return statusToUIStatus[status] || POLICY_UI_STATUS.ENDED;
  }

  private getDisplayStatus(displayStatus: string): string {
    return this.t.instant(POLICY_DISPLAY_STATUS[displayStatus]);
  }

  constructor(private httpClient: HttpClient, private jobService: JobService, private t: TranslateService) { }

  createPolicy(payload: { policy: PolicyPayload, targetClusterId: string }): Observable<any> {
    const { policy, targetClusterId } = payload;
    return this.httpClient.post(`clusters/${targetClusterId}/policy/${policy.policyDefinition.name}/submit`, policy);
  }

  fetchPolicies(queryParams = {}): Observable<any> {
    const params = toSearchParams(queryParams);
    return this.httpClient.get<any>('policies', {params}).map(response => {
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
    return this.httpClient.get<any>(`policies/${id}`);
  }

  schedulePolicy(payload: { policyName: string, targetClusterId: string|number}) {
    return this.httpClient.put(`clusters/${payload.targetClusterId}/policy/${payload.policyName}/schedule`, {});
  }

  private getManagePolicyUrl(policy: Policy): string {
    return `clusters/${policy.targetClusterResource.id}/policy/${policy.name}`;
  }

  deletePolicy(payload: Policy): Observable<any> {
    return this.httpClient.delete(this.getManagePolicyUrl(payload));
  }

  suspendPolicy(payload: Policy): Observable<any> {
    return this.httpClient.put(`${this.getManagePolicyUrl(payload)}/suspend`, {});
  }

  resumePolicy(payload: Policy): Observable<any> {
    return this.httpClient.put(`${this.getManagePolicyUrl(payload)}/resume`, {});
  }

}
