import { RequestStatus } from './request-status.model';
import { Cluster } from './cluster.model';
import { Job } from './job.model';

export interface Policy {
  id: string;
  name: string;
  type: string;
  dataset: string;
  status: string;
  sourceCluster: string;
  targetCluster: string;
  sourceClusterResource?: Cluster;
  targetClusterResource?: Cluster;
  lastJobResource?: Job;
  jobsResource?: Job[];
  sourceDataset: string;
  targetDataset: string;
  endTime: string;
  frequency: number;
  policyStatus: RequestStatus;
  tags: string[];
  customProperties: Object;
  retry: Object;
  description: string;
  lastJobs: Job[];
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
