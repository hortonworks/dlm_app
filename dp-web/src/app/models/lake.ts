/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
  ambariIpAddress: string;
  state: string;
  clusterId:number;
  isDatalake:boolean;
  knoxEnabled?:boolean;
  knoxUrl?:string;
  allowUntrusted: boolean;
  behindGateway: boolean;
  isWaiting: boolean;
}
