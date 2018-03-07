/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { RequestStatus } from './request-status.model';
import { Cluster } from './cluster.model';
import { Job } from './job.model';
import { POLICY_MODES } from 'constants/policy.constant';

// @todo: consider moving non-required attrs like lastTenJobs, lastJobResource, accessMode
// to separate interface according to its usage. e.g. interface for policy table content
export interface PolicyUI {
  lastJobResource?: Job;
  jobsResource?: Job[];
  lastTenJobs?: Job[];
  policyStatus: RequestStatus;
  sourceClusterResource?: Cluster;
  targetClusterResource?: Cluster;
  displayStatus: string; // translated uiStatus, need to keep it here for filtering
  uiStatus: string;
  accessMode?: POLICY_MODES;
  rangerEnabled?: boolean;
  lastSucceededJobTime?: string;
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
  cloudCred?: string;
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
  targetSnapshotRetentionNumber?: string;
  sourceSnapshotRetentionAgeLimit?: string;
}

export interface SummaryTreeItem {
  label: string;
  value: string;
  iconClass: string;
}
