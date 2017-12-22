/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Cluster } from './cluster.model';

export interface Pairing {
  id: string;
  pair: Array<Cluster>;
}

export interface PairingBodyItem {
  clusterId: number;
  beaconUrl: string;
}

export type PairingRequestBody = PairingBodyItem[];
