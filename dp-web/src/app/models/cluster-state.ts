export class ClusterState {
  ambariApiCheck: boolean;
  knoxDetected: boolean;
  ambariApiStatus: number;
  knoxUrl?:string;
  ambariIpAddress:string;
  alreadyExists: boolean;
  requestAmbariCreds:boolean;
  requestKnoxURL:boolean;
}

export class ClusterDetailRequest{
  url:string;
  knoxDetected:boolean;
  knoxUrl?:string;
  ambariUser?:string;
  ambariPass?:string;
  knoxTopology?:string;
}

