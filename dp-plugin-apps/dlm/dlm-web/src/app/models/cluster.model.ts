import { Location } from './location.model';
import { Service } from './service.model';
import { ClusterStats } from './cluster-stats.model';

export interface ClusterStats {
  CapacityTotal: number;
  CapacityUsed:  number;
  CapacityRemaining: number;
};

export interface Cluster {
  id: string;
  name: string;
  ambariurl: string;
  description: string;
  location: Location;
  services: Array<Service>;
  stats?: ClusterStats;
  /*
    The following properties need to be removed eventually
    since the API response doesn't align with these properties
   */
  type: string;
  createdAt: number;
  volumeGB: number;
  nodesCount: number;
}
