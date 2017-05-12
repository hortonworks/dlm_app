export interface Service {
  id: number;
  servicename: string;
  servicehost: string;
  serviceport: string;
  fullURL: string;
  properties: Object;
  clusterid: number;
  datalakeid: number;
}
