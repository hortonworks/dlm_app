export class Cluster {
   id?: string;
   name: string;
   description: string = '';
   ambariUrl?: string;
   ambariuser?: string;
   ambaripass?: string;
   secured?: boolean;
   kerberosuser?: string;
   kerberosticketLocation?: string;
   datalakeid?: number;
   userid?: number;
   properties?: any;
}
