import { RequestStatus } from './request-status.model';
import { ClusterDetails } from './cluster-details.model';

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
}
