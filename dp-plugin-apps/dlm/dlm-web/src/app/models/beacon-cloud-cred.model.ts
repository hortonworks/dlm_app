/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Policy } from 'models/policy.model';


export interface CloudAccountSyncStatus {
  clusterId: number;
  isInSync: boolean;
}
export interface BeaconCloudCred {
  id: string;
  name: string;
  provider: string;
  clusterId: string;
  policies?: Policy;
  clusters?: CloudAccountSyncStatus[];
}

export interface BeaconCloudCredWithPoliciesResponse {
  unreachableBeacon: any[];
  allCloudCreds: {
    name: string;
    policies: Policy[];
    clusters: CloudAccountSyncStatus[];
  }[];
}

interface CloudCredentialConfigs {
  version: string;
}

export interface CloudCredential {
  id: string;
  name: string;
  provider: string;
  creationTime: string;
  lastModifiedTime: string;
  configs: CloudCredentialConfigs;
}

interface CloudCredsResponse {
  requestId: string;
  totalResults: number;
  results: number;
  cloudCred: CloudCredential[];
}

export interface BeaconCloudCredentialsResponse {
  unreachableBeacon: any[];
  allCloudCreds: {
    clusterId: string;
    beaconUrl: string;
    cloudCreds: CloudCredsResponse;
  }[];
}
