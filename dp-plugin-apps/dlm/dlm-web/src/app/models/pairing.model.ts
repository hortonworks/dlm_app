import { ClusterDetails } from './cluster-details.model';

export interface Pairing {
  id: string;
  firstCluster: {
    id: string;
    clusterDetails: ClusterDetails;
  };
  secondCluster: {
    id: string;
    clusterDetails: ClusterDetails;
  };
}
