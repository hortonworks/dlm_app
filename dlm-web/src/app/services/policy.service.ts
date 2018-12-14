/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */


import {map} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import {Policy, PolicyPayload, PolicyUpdatePayload, PolicyPlugin} from 'models/policy.model';
import { toSearchParams } from 'utils/http-util';
import { JobService } from 'services/job.service';
import { POLICY_DISPLAY_STATUS, POLICY_STATUS, POLICY_UI_STATUS } from 'constants/status.constant';
import { without } from 'utils/array-util';

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

  private parsePolicyPlugins(plugins: [string]): PolicyPlugin[] {
    if (!plugins) {
      return [];
    }
    return without(plugins[0].substr(1, plugins[0].length - 2).split(','), '');
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
    policy.activePlugins = this.parsePolicyPlugins(policy.plugins);
    return policy;
  }

  private getUIStatus(status: string): string {
    const statusToUIStatus = {
      [POLICY_STATUS.RUNNING]: POLICY_UI_STATUS.ACTIVE,
      [POLICY_STATUS.SUSPENDED]: POLICY_UI_STATUS.SUSPENDED,
      [POLICY_STATUS.SUSPENDEDFORINTERVENTION]: POLICY_UI_STATUS.SUSPENDED
    };
    return statusToUIStatus[status] || POLICY_UI_STATUS.ENDED;
  }

  private getDisplayStatus(displayStatus: string): string {
    return this.t.instant(POLICY_DISPLAY_STATUS[displayStatus]);
  }

  private getManagePolicyUrl(policy: Policy): string {
    return `clusters/${policy.clusterResourceForRequests.id}/policy/${policy.name}`;
  }

  constructor(private httpClient: HttpClient, private jobService: JobService, private t: TranslateService) { }

  createPolicy(payload: { policy: PolicyPayload, targetClusterId: string }): Observable<any> {
    const { policy, targetClusterId } = payload;
    return this.httpClient.post(`clusters/${targetClusterId}/policy/${policy.policyDefinition.name}/submit`, policy);
  }

  updatePolicy(payload: { policy: Policy, updatePayload: PolicyUpdatePayload }): Observable<any> {
    const { policy, updatePayload } = payload;
    return this.httpClient.put(`${this.getManagePolicyUrl(policy)}`, updatePayload);
  }

  fetchPolicies(queryParams = {}): Observable<any> {
    const params = toSearchParams(queryParams);
    return this.httpClient.get<any>('policies', {params}).pipe(map(response => {
      response.policies.forEach(policy => {
        policy.jobs = policy.jobs.map(job => this.jobService.normalizeJob(job));
        policy = {
          ...policy,
          ...this.normalizePolicy(policy)
        };
      });
      return response;
    }));
  }

  fetchPolicy(id: string): Observable<any> {
    return this.httpClient.get<any>(`policies/${id}`);
  }

  schedulePolicy(payload: { policyName: string, targetClusterId: string|number}) {
    return this.httpClient.put(`clusters/${payload.targetClusterId}/policy/${payload.policyName}/schedule`, {});
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

  validatePolicy(data): Observable<any> {
    const url = `clusters/${data.idForUrl}/policy/test`;
    delete data.idForUrl;
    return this.httpClient.post(url, data);
  }

}
