export class ClusterState {
  ambariApiCheck: boolean;
  knoxDetected: boolean;
  ambariApiStatus: number;
  knoxUrl?:string;
  alreadyExists: boolean;
}

export class ClusterDetailRequest{
  url:string;
  knoxDetected:boolean;
  knoxUrl?:string;
}

