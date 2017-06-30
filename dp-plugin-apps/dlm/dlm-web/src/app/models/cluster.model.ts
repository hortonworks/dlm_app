import { Location } from './location.model';
import { Service } from './service.model';

export interface ClusterStats {
  CapacityTotal: number;
  CapacityUsed:  number;
  CapacityRemaining: number;
}

export interface Cluster {
  id: number;
  name: string;
  dataCenter: string;
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
  nodesCount: number;
}
