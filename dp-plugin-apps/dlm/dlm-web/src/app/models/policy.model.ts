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

export interface Policy {
  id: string; // UI specific
  name: string;
  type: string;
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
  customProperties: Object;
  retry: Object;
  description: string;
  jobs: Job[];
  // UI specific props
  lastJobResource?: Job;
  jobsResource?: Job[];
  lastTenJobs?: Job[];
  policyStatus: RequestStatus;
  sourceClusterResource?: Cluster;
  targetClusterResource?: Cluster;
}

export interface PolicyDefinition {
  type: string;
  name: string;
  description?: string;
  sourceCluster: string;
  targetCluster: string;
  sourceDataset: string;
  frequencyInSec: number;
  startTime?: string;
  endTime?: string;
  queueName?: string;
  distcpMapBandwidth?: number;
}

export interface PolicyPayload {
  policyDefinition: PolicyDefinition;
  submitType: string;
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
