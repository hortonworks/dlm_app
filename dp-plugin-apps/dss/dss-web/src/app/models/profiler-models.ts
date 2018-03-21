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


export class JobsCountModel {
  SUCCESS?:number;
	RUNNING?:number;
	STARTED?:number;
	FAILED?:number;
	UNKNOWN?:number;
}

export class ProfilerModel {
	id:number;
	name:string;
	displayName:string;
	version:string;
	active:boolean;
}

export class ProfilerInfoWithJobsCount {
	profilerInfo : ProfilerModel;
	jobsCount:JobsCountModel;
}

export class ProfilerInfoWithAssetsCount {
	profilerInfo : ProfilerModel;
	assetsCount:number;
}

export class JobInfoModel{
	id:number;
    profilerId:number;
    profiler: string;
    status: string;
    queue: string;
    sparkUiUrl: string;
    driverLogUrl: string;
    start: number;
}
