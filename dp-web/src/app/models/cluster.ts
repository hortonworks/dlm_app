export class Cluster {
   id?: number;
   name: string;
   description: string = '';
   ambariurl?: string;
   ambariuser?: string;
   ambaripass?: string;
   secured?: boolean;
   kerberosuser?: string;
   kerberosticketLocation?: string;
   datalakeid?: number;
   userid?: number;
   properties?: any;
}

export class ClusterHealth {
  id: number;
  status: string;
  state: string;
  uptime: number;
  started: string;
  clusterId: number;
}
