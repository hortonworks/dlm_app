import {Location} from "./location";
export class Cluster {
  id: number;
  name: string;
  description: string = '';
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
  properties: any;
}

export class ClusterHealthSummary {
  nodes: number;
  size: string;
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
}


