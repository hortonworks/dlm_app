import { RequestStatus } from './request-status.model';

export interface Policy {
  id: string;
  name: string;
  type: string;
  dataset: string;
  sourceCluster: string;
  targetCluster: string;
  frequencyInSec: number;
  policyStatus: RequestStatus;
  customProperties: Object;
  retry: Object;
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
};

export interface PolicyPayload {
  policyDefinition: PolicyDefinition;
  submitType: string;
};
