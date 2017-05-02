import { Cluster } from './cluster.model';

export interface ClusterPairing extends Cluster {
  disabled?: boolean;
}
