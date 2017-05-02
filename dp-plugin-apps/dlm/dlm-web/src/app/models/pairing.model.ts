import { Cluster } from './cluster.model';

export interface Pairing {
  id: string;
  pair: Array<Cluster>;
}
