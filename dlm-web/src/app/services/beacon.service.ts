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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BeaconCloudCredWithPoliciesResponse, BeaconCloudCredentialsResponse } from 'models/beacon-cloud-cred.model';
import { BeaconConfigStatusResponse, BeaconSuperUserStatus } from 'models/beacon-config-status.model';
import { Observable } from 'rxjs';
import { PolicyService } from 'services/policy.service';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { Cluster } from 'cluster';
import { uniqBy } from 'utils/array-util';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class BeaconService {

  static createUreachableBeaconMessage(clusters: Cluster[], t: TranslateService) {
    let clusterTranslate = { clusters: null };
    if (clusters.length) {
      let clusterNames = uniqBy(clusters, 'idByDatacenter')
        .map(cluster => `<strong>${cluster.name} (${cluster.dataCenter})</strong>`);
      if (clusterNames.length > 1) {
        clusterNames = [clusterNames.slice(0, clusterNames.length - 1).join(', ')].concat(clusterNames[clusterNames.length - 1]);
      }
      clusterTranslate = { clusters: clusterNames.join(` ${t.instant('common.and').toLowerCase()} `) };
    }
    return t.instant('common.warnings.beacon_unavailable', clusterTranslate);
  }

  private dlmEngineVersion(version: string): string {
    return version.split('.').slice(3, 6).join('.');
  }

  private makeAdminStatusId(status) {
    return status.clusterId;
  }

  private getAdminPlugins(status): string[] {
    return status.beaconAdminStatus.plugins.split(',');
  }

  private parseVersion(status: BeaconAdminStatus): BeaconAdminStatus {
    status.beaconAdminStatus.is10 = status.beaconAdminStatus.version.startsWith('1.0.0.1.0');
    status.beaconAdminStatus.versionToCompare = status.beaconAdminStatus.version.split('.').slice(0, 6).join('.');
    status.beaconAdminStatus.dlmEngineVersion = this.dlmEngineVersion(status.beaconAdminStatus.version);
    return status;
  }

  private decorateStatuses(statusList) {
    return statusList.map(status => {
      status = this.parseVersion(status);
      return {
        ...status,
        plugins: this.getAdminPlugins(status),
        id: this.makeAdminStatusId(status)
      };
    });
  }

  fetchBeaconAdminStatus() {
    return this.httpClient.get<any>('beacon/admin/status').pipe(
      map(response => ({...response, response: this.decorateStatuses(response.response)})));
  }

  fetchBeaconCloudCreds(): Observable<BeaconCloudCredentialsResponse> {
    return this.httpClient.get<any>('cluster/cloudCredentials');
  }

  fetchBeaconCloudCredsWithPolicies(): Observable<BeaconCloudCredWithPoliciesResponse> {
    return this.httpClient.get<BeaconCloudCredWithPoliciesResponse>('cluster/cloudCredWithPolicies').pipe(map(r => {
      const allCloudCreds = r.allCloudCreds.map(cred => ({
        ...cred,
        policies: cred.policies.map(policy => this.policyService.normalizePolicy(policy))
      }));
      return {
        ...r,
        allCloudCreds
      };
    }));
  }

  fetchBeaconConfigStatus(): Observable<BeaconConfigStatusResponse> {
    return this.httpClient.get<BeaconConfigStatusResponse>('clusters/beacon/config/status');
  }

  fetchBeaconSuperUserStatus(clusterId: string): Observable<BeaconSuperUserStatus> {
    return this.httpClient.get<BeaconSuperUserStatus>(`beacon/cluster/${clusterId}/user`);
  }

  constructor(private httpClient: HttpClient, private policyService: PolicyService) { }
}
