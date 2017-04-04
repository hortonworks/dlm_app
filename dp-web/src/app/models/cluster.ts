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

export class ClusterHealthSummary {
  nodes: number;
  size: string;
  status: {
    state: string,
    since: number
  };
}
