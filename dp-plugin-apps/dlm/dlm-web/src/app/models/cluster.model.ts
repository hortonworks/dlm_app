/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Location } from './location.model';
import { Service } from './service.model';

export interface ClusterStats {
  CapacityTotal: number;
  CapacityUsed:  number;
  CapacityRemaining: number;
}

export interface ServiceStatus {
  service_name: string;
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
