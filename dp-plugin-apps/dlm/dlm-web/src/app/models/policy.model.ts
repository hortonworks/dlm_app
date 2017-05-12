import { RequestStatus } from './request-status.model';

export interface Policy {
  id: string;
  name: string;
  type: string;
  dataset: string;
  status: string;
  sourceCluster: string;
  targetCluster: string;
  endTime: string;
  frequency: number;
  policyStatus: RequestStatus;
  tags: string[];
  customProperties: Object;
  retry: Object;
}
