export class ClusterState {
  ambariApiCheck: boolean;
  knoxDetected: boolean;
  ambariApiStatus: number;
  knoxUrl?:string;
}

export class ClusterDetailRequest{
  url:string;
  knoxDetected:boolean;
  knoxUrl?:string;
}

