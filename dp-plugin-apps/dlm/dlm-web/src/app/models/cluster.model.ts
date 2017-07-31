import { Location } from './location.model';
import { Service } from './service.model';

export interface ClusterStats {
  CapacityTotal: number;
  CapacityUsed:  number;
  CapacityRemaining: number;
}

export interface ServiceStatus {
  serviceName: string;
  state: string;
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
  healthStatus?: string;
  status: ServiceStatus[];
  totalHosts;
}
