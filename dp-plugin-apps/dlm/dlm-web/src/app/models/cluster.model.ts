import { RequestStatus } from './request-status.model';
import { ClusterDetails } from './cluster-details.model';
import { Service } from './service.model';

export interface Cluster {
  id: string;
  type: string;
  ambariUrl: string;
  userName: string;
  clusterType: string;
  createdAt: number;
  volumeGB: number;
  nodesCount: number;
  clusterStatus: RequestStatus;
  clusterDetails: ClusterDetails;
  services: Array<Service>;
}
