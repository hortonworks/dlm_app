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

import {Component, OnInit} from '@angular/core';
import {LakeService} from '../../../services/lake.service';

export class JobStatusFilterState {
	"Completed":boolean = true;
	"Running":boolean = false;
	"Failed":boolean = false;	
}

export class ProfilersFilterState {
	"Sensitivity":boolean = true;
	"Hive Column":boolean = false;
	"Hive Meta":boolean = false;
	"Audit":boolean = false;	
}

export class JobsCountModel {
	Completed:number;
	Running:number;
	Failed:number;
}

export class ProfilerModel {
	id:number;
	name:string;
	version:string;
	isActive:boolean;
	counts:JobsCountModel;
}

export class JobStatusModel {
	jobId:string;
	status:string;
	sTime:string;
	eTime:string;
	eta:string;
	cluster:string;
	queue:string;
	profiler:string;
}

const jobStatusList=[
	{"jobId":"JOBID0001", "status":"Compleated", "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Sensitivity"},
	{"jobId":"JOBID0002", "status":"Compleated", "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Hive Column"},
	{"jobId":"JOBID0003", "status":"Running",    "sTime":"12:20:22", "eTime":"-", "eta":"13:10:45", "cluster":"Cl1", "queue":"root", "profiler":"Hive Column"},
	{"jobId":"JOBID0004", "status":"Compleated", "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Hive Meta"},
	{"jobId":"JOBID0005", "status":"Running",    "sTime":"12:20:22", "eTime":"-", "eta":"13:10:45", "cluster":"Cl1", "queue":"root", "profiler":"Audit"},
	{"jobId":"JOBID0006", "status":"Compleated", "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Sensitivity"},
	{"jobId":"JOBID0007", "status":"Compleated", "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Audit"},
	{"jobId":"JOBID0008", "status":"Failed",     "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Audit"},
	{"jobId":"JOBID0009", "status":"Failed",     "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Hive Column"},
	{"jobId":"JOBID0010", "status":"Compleated", "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Hive Column"},
	{"jobId":"JOBID0011", "status":"Compleated", "sTime":"12:20:22", "eTime":"13:10:45", "eta":"-", "cluster":"Cl1", "queue":"root", "profiler":"Sensitivity"},
]

const profilersObjList = [
	{"id":1, "name":"Sensitivity", "version":"1.1", "isActive":false, "counts":{Completed:5,Running:2,Failed:0}},
	{"id":2, "name":"Hive Column", "version":"1.1", "isActive":true, "counts":{Completed:8,Running:7,Failed:3}},
	{"id":3, "name":"Hive Meta", "version":"1.1", "isActive":true, "counts":{Completed:10,Running:8,Failed:4}},
	{"id":4, "name":"Audit", "version":"1.1", "isActive":true, "counts":{Completed:7,Running:3,Failed:3}}
]

const jobsCountModel = {Completed:30,Running:20,Failed:10}

@Component({
  selector: 'profilers-jobs-dashboard',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})

export class ProfilerJobsComponent  implements OnInit {
  
  JSObject: Object = Object;
  clusters = [];
  jSFState:JobStatusFilterState =  new JobStatusFilterState();
  profState:ProfilersFilterState = new ProfilersFilterState();
  clstrFilState = {};
  sortInfo = {'col':'jobId', 'order':'desc'}

  jobs:Array<JobStatusModel> = [];


  jobsCountModel:JobsCountModel = jobsCountModel;
  profilersList:Array<ProfilerModel> = profilersObjList;

  constructor(private lakeService: LakeService){}

  ngOnInit() {
  	this.lakeService.list().subscribe(lakes => {
  		lakes = lakes.filter(lake => lake.isDatalake).sort((a, b) => a.name.localeCompare(b.name));
  		lakes.forEach((lake, i)=>this.clstrFilState[lake.id]=(!i)?true:false);
  		this.clusters = lakes;
  		this.reloadJobs();
  	}); 
  }

  reloadJobs() {
  	this.jobs = [];
  	setTimeout(()=>this.jobs = jobStatusList, 500);
  }

  sordBy(colName) {
  	const order = (this.sortInfo.col === colName)?((this.sortInfo.order === 'desc')?'asc':'desc'):'desc'
  	this.sortInfo.col = colName;
  	this.sortInfo.order = order;
  	this.reloadJobs();
  }

  jsfChanged(key) {
  	this.jSFState[key] = !this.jSFState[key];
  	this.reloadJobs();
  }
  profFilChanged(name) {
  	this.profState[name] = ! this.profState[name];
  	this.reloadJobs();
  }
  clusterFilterChanged (clstrId) {
  	this.clusters.forEach(lake=>this.clstrFilState[lake.id]=false)
  	this.clstrFilState[clstrId]=true;
  	this.reloadJobs();
  }

}