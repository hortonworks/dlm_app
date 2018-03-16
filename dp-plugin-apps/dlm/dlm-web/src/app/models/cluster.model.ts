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
import { BeaconConfigStatusDetails } from 'models/beacon-config-status.model';

export interface ClusterStats {
  CapacityTotal: number;
  CapacityUsed:  number;
  CapacityRemaining: number;
}

export interface ServiceStatus {
  service_name: string;
  state: string;
}

export interface ClusterUI {
  healthStatus?: string;
  ambariWebUrl: string;
  idByDatacenter: string;
  beaconConfigStatus: BeaconConfigStatusDetails;
}

export interface Cluster extends ClusterUI {
  id: number;
  name: string;
  dataCenter: string;
  ambariurl: string;
  description: string;
  location: Location;
  beaconUrl: string;
  stats?: ClusterStats;
  status: ServiceStatus[];
  totalHosts;
}

export interface ClusterAction {
  label: string;
  type: string;
}
