import {Location} from "./location";
export class Cluster {
   id?: number;
   name: string;
   description: string = '';
   ambariurl?: string;
   ipAddress?:string;
   services?:string[] = [];
   location: Location;
   tags:string[] = [];
   ambariuser?: string;
   ambaripass?: string;
   secured?: boolean;
   kerberosuser?: string;
   kerberosticketLocation?: string;
   datalakeid?: number;
   userid?: number;
   properties?: any;

   public static getClusterInfo(ambariUrl: string) {
     let cluster = new Cluster();
     cluster.ambariurl = ambariUrl;
     cluster.name = `CL-${Math.ceil(Math.random()*100)}`;
     let urlParts = ambariUrl.split("/");
     cluster.ipAddress = urlParts.length ? urlParts[2].substr(0, urlParts[2].indexOf(":")) : "";
     console.log(cluster.ipAddress)
     let isDatalake = Math.random() >= 0.5;
     if(isDatalake){
       cluster.services = [ "HDFS", "RANGER", "MAPREDUCE2", "ATLAS", "KAFKA", "AMBARI_METRICS", "AMBARI_INFRA", "KNOX", "ZOOKEEPER", "HIVE", "YARN", "HBASE", "PIG", "SLIDER", "TEZ", "SMARTSENSE" ];
     }else{
       cluster.services = [ "HDFS", "MAPREDUCE2", "ATLAS", "KAFKA", "AMBARI_METRICS", "AMBARI_INFRA", "KNOX", "ZOOKEEPER", "HIVE", "YARN", "HBASE", "PIG", "SLIDER", "TEZ", "SMARTSENSE" ];
     }

     return cluster;
   }
}

export class ClusterHealthSummary {
  nodes: number;
  size: string;
  status: {
    state: string,
    since: number
  };
}


