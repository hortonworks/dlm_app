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
import {LakeService} from '../../../../services/lake.service';
import {ProfilerService} from '../../../../services/profiler.service';
import {JobsCountModel, ProfilerInfoWithJobsCount, JobInfoModel} from '../../../../models/profiler-models';


export class JobStatusFilterState {
	"SUCCESS":boolean = false;
	"RUNNING":boolean = false;
	"FAILED":boolean = false;	
}

export class ProfilersFilterState {
	"sensitiveinfo":boolean = false;
	"hivecolumn":boolean = false;
	"hive_metastore_profiler":boolean = false;
	"audit":boolean = false;	
}

export enum  TimeTabs {
  D, W, M 
}

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
  currentClusterId = 0;
  currentClusterName = "";
  sortInfo = {'col':'id', 'order':'desc'}

  jobs:Array<JobInfoModel> = [];

  jobsCountModel:JobsCountModel = {SUCCESS:0,RUNNING:0,FAILED:0};
  profilersList:Array<ProfilerInfoWithJobsCount> = [];

  statusDisplayMap = {"SUCCESS":"Completed", "RUNNING":"Running", "FAILED":"Failed"};
  timeTabs = TimeTabs;
  timeSelect:TimeTabs = TimeTabs.D;

  constructor( private lakeService: LakeService
             , private profilerService:ProfilerService
             ){}

  ngOnInit() {
  	this.lakeService.listWithClusterId().subscribe(lakes => {
  		lakes = lakes.sort((a, b) => a.name.localeCompare(b.name));
  		lakes.forEach((lake, i)=>this.clstrFilState[lake.clusterId]=(!i)?true:false);
  		this.clusters = lakes;
      this.currentClusterId = lakes[0].clusterId;
      this.currentClusterName = lakes[0].name + ", " + lakes[0].dcName;
      this.relodeProfilerStatus();
  		this.reloadJobs();
  	}); 
  }

  relodeProfilerStatus () {
    this.profilersList = [];
    var d = new Date();
    const endTime = d.getTime();
    const multiplyBy = (this.timeSelect === TimeTabs.D)?0:(this.timeSelect === TimeTabs.W ? 6:29);
    d.setHours(-24*multiplyBy,0,0,0);
    const startTime = d.getTime();

    this.profilerService.getStatusWithJobCounts(this.currentClusterId, startTime, endTime)
      .subscribe(infoAndCounts => {
        this.profilersList = infoAndCounts
        this.updateJobsCountModel();
      });
  }

  updateJobsCountModel () {
    this.jobsCountModel = {SUCCESS:0,RUNNING:0,FAILED:0}
    this.profilersList.forEach(pInfo => {
      this.jobsCountModel.SUCCESS += pInfo.jobsCount.SUCCESS
      this.jobsCountModel.RUNNING += pInfo.jobsCount.RUNNING
      this.jobsCountModel.FAILED += pInfo.jobsCount.FAILED
    })
  }

  reloadJobs() {
  	this.jobs = [];
    let d = new Date();
    const endTime = d.getTime();
    const multiplyBy = (this.timeSelect === TimeTabs.D)?0:(this.timeSelect === TimeTabs.W ? 6:29);
    d.setHours(-24*multiplyBy,0,0,0);
    const startTime = d.getTime();

    let profilerIds = [];
    this.profilersList.forEach(pObj => {
      if(this.profState[pObj.profilerInfo.name])
        profilerIds.push(pObj.profilerInfo.id);
    }) 

    let statusArray = [];
    for (let key in this.jSFState) {
      if(this.jSFState[key])
        statusArray.push(key.toUpperCase())
    }
    
    this.profilerService.jobsList(this.currentClusterId, 0, 50, this.sortInfo.col, this.sortInfo.order, startTime, endTime, profilerIds, statusArray)
      .subscribe(jobs => {
        this.jobs = jobs;
      })
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
  	this.clusters.forEach(lake=>{
      this.clstrFilState[lake.clusterId]=false;
      if(lake.clusterId === clstrId)
        this.currentClusterName = lake.name + ", " + lake.dcName;
    })
  	this.clstrFilState[clstrId]=true;
    this.currentClusterId = clstrId;
    this.relodeProfilerStatus();
  	this.reloadJobs();
  }

  timeTabChanged() {
    for (let key in this.profState) {
      this.profState[key] = false;
    } 
    this.reloadJobs(); 
    this.relodeProfilerStatus();
  }

  getDisplayDate(epoch:number) {
    return (new Date(epoch)).toString().substr(4,20);
  }

}