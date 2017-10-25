/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Location} from "./location";
export class Cluster {
  id: number;
  name: string;
  description: string = '';
  dcName: string;
  ambariurl: string;
  ipAddress: string;
  services: string[] = [];
  location: Location;
  tags: string[] = [];
  ambariuser: string;
  ambaripass: string;
  secured: boolean;
  kerberosuser: string;
  kerberosticketLocation: string;
  datalakeid: number;
  userid: number;
  dataplaneClusterId: number;
  properties: any;
  knoxUrl?:string;

}

export class ClusterHealthSummary {
  nodes: number;
  size: string;
  totalSize: string;
  usedSize: string;
  status: {
    state: string,
    since: number
  };
}

export class ClusterDetails {
 nodes: number;
 size: string;
 securityType: number;
 location: string;
 dataCenter: string;
 noOfSerices: number;
 heapSizeUsed: string;
 heapSizeTotal: string;
 healthyNodes: number;
 hdfsTotal: string;
 hdfsUsed: string;
 hdpVersion: string;
 unhealthyNodes: number;
 networkUsage: number;
 ldapUrl: string;
 tags: string;
 uptime: string;
 status: string;
 nodeManagersActive: number;
 nodeManagersInactive: number;
 rmHeapUsed: string;
 rmHeapTotal: string;
 rmUptime: string;
 healthyDataNodes: number;
 unhealthyDataNodes: number;
}

export class ServiceInfo {
  serviceName: string;
  state: string;
  serviceVersion: string;
}
