export class Lake {
  id: number;
  name: string;
  dcName: string;
  description: string;
  location: number;
  createdBy: string;
  properties: any;
  created: string;
  updated: string;
  ambariUrl: string;
  state: string;
  clusterId:number;
  isDatalake:boolean;
  knoxEnabled?:boolean;
  knoxUrl?:string;
  isWaiting: boolean = false;
}
