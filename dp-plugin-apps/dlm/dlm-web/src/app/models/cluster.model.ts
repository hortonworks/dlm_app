import { Location } from './location.model';
import { Service } from './service.model';

export interface Cluster {
  id: string;
  name: string;
  ambariurl: string;
  description: string;
  location: Location;
  services: Array<Service>;
}
