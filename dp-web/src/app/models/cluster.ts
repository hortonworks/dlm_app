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


