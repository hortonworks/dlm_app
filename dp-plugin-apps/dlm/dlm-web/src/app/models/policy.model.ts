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
  policyStatus: RequestStatus;
  sourceClusterResource?: Cluster;
  targetClusterResource?: Cluster;
}

export interface PolicyDefinition {
  type: string;
  name: string;
  sourceCluster: string;
  targetCluster: string;
  sourceDataset: string;
  frequencyInSec: number;
  startTime?: string;
  endTime?: string;
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
