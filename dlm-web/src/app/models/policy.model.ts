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

import { TemplateRef } from '@angular/core';
import { RequestStatus } from './request-status.model';
import { Cluster } from './cluster.model';
import { Job } from './job.model';
import { POLICY_MODES, AWS_ENCRYPTION } from 'constants/policy.constant';
import { CloudCredential } from 'models/beacon-cloud-cred.model';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';

// @todo: consider moving non-required attrs like lastTenJobs, lastJobResource, accessMode
// to separate interface according to its usage. e.g. interface for policy table content
export interface PolicyUI {
  lastJobResource?: Job;
  jobsResource?: Job[];
  lastTenJobs?: Job[];
  policyStatus: RequestStatus;
  sourceClusterResource?: Cluster;
  targetClusterResource?: Cluster;
  cloudCredentialResource?: CloudCredential;
  sourceType: string;
  targetType: string;
  clusterResourceForRequests?: Cluster;
  displayStatus: string; // translated uiStatus, need to keep it here for filtering
  uiStatus: string;
  accessMode?: POLICY_MODES;
  rangerEnabled?: boolean;
  lastSucceededJobTime?: string;
  lastGoodJobResource?: Job;
  lastJobDuration?: number;
  beaconAdminStatus?: BeaconAdminStatus;
}

export interface LastInstanceDetail {
  status: 'SUCCESS' | 'FAILED';
  endTime: string;
}

export interface Report {
  lastSucceededInstance?: LastInstanceDetail;
  lastFailedInstance?: LastInstanceDetail;
}

export interface Policy extends PolicyUI {
  id: string; // UI specific
  name: string;
  type: string;
  executionType: string;
  dataset: string;
  status: string;
  sourceCluster: string;
  targetCluster: string;
  sourceDataset: string;
  targetDataset: string;
  policyId: string;
  startTime?: string;
  endTime: string;
  frequency: number;
  tags: string[];
  retry: Object;
  description: string;
  jobs: Job[];
  report: Report;
  customProperties?: CustomProperties;
}

export interface PolicyDefinition {
  type: string;
  name: string;
  description?: string;
  sourceCluster: string;
  targetCluster: string;
  sourceDataset: string;
  targetDataset: string;
  frequencyInSec: number;
  startTime?: string;
  endTime?: string;
  queueName?: string;
  distcpMapBandwidth?: number;
  distcpMaxMaps?: number;
  cloudCred?: string;
  'tde.sameKey'?: boolean;
  setSnapshottable?: boolean;
  'cloud.encryptionAlgorithm'?: AWS_ENCRYPTION;
  'cloud.encryptionKey'?: string;
  plugins?: string;
}

export interface PolicyPayload {
  policyDefinition: PolicyDefinition;
}

export interface PolicyForm {
  name: string;
  description: string;
  type: string;
  sourceCluster: string;
  destinationCluster: string;
  directories?: string;
  databases?: string;
  queueName?: string;
  maxBandwidth?: number;
}

export interface CustomProperties {
  cloudCred?: string;
  distcpMapBandwidth?: string;
  targetSnapshotRetentionAgeLimit?: string;
  sourceSnapshotRetentionNumber?: string;
  distcpMaxMaps?: string;
  preserveAcl?: string;
  queueName?: string;
  tdeEncryptionEnabled?: string;
  preservePermission?: string;
  enableSnapshotBasedReplication?: string;
  targetSnapshotRetentionNumber?: string;
  sourceSnapshotRetentionAgeLimit?: string;
  'tde.sameKey'?: string;
  'tde.enabled'?: string;
}

export interface PolicyUpdatePayload {
  description?: string;
  queueName?: string;
  'tde.sameKey'?: boolean;
  frequencyInSec?: number;
  startTime?: string;
  endTime?: string;
  distcpMapBandwidth?: number;
  distcpMaxMaps?: number;
  enableSnapshotBasedReplication?: boolean;
}

export interface SummaryTreeItem {
  id?: string;
  label: string;
  value: string;
  iconClass: string;
  headerTemplate?: TemplateRef<any>;
  headerTemplateContext?: any;
  detailsTemplate?: TemplateRef<any>;
  detailsTemplateContext?: any;
}
