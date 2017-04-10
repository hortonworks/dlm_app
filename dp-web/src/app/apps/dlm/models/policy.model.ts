import { RequestStatus } from './request-status.model';

export interface Policy {
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
