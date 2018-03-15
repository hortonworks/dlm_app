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
import {ProfilerService} from '../../../../services/profiler.service';
import {LakeService} from '../../../../services/lake.service';
import {JobsCountModel, ProfilerModel, ProfilerInfoWithAssetsCount, JobInfoModel} from '../../models/profilerModels';

// export class JobsCountModel {
// 	Completed:number;
// 	Running:number;
// 	Failed:number;
// }

// export class ProfilerModel {
// 	id:number;
// 	name:string;
// 	version:string;
// 	isActive:boolean;
// 	assetsCount:number;
// 	counts:JobsCountModel;
// }

const profilersObjList = [
	{"id":1, "name":"Sensitivity", "version":"1.1", "isActive":false, "assetsCount":30, "counts":{Completed:5,Running:2,Failed:0}},
	{"id":2, "name":"Hive Column", "version":"1.1", "isActive":true, "assetsCount":40, "counts":{Completed:8,Running:7,Failed:3}},
	{"id":3, "name":"Hive Meta", "version":"1.1", "isActive":true, "assetsCount":50, "counts":{Completed:10,Running:8,Failed:4}},
	{"id":4, "name":"Audit", "version":"1.1", "isActive":true, "assetsCount":35, "counts":{Completed:7,Running:3,Failed:3}}
]

const senstivityProfilerData = [
	{"status":"allPass", "assetsProfiled":"100%"},
	{"status":"allPass", "assetsProfiled":"80%"},
	{"status":"somePass", "assetsProfiled":"90%"},
	{"status":"allPass", "assetsProfiled":"100%"},
	{"status":"failed", "assetsProfiled":"0%"},
	{"status":"allPass", "assetsProfiled":"100%"}
]

@Component({
  selector: 'profilers-configs-dashboard',
  templateUrl: './configs.component.html',
  styleUrls: ['./configs.component.scss']
})

export class ProfilerConfigsComponent implements OnInit {
  
  clusters = [];
  selectedLake = null;
  profilers:Array<ProfilerInfoWithAssetsCount> = [];
  senstivityProfilerData = [];
  currentClusterId:number;

  constructor( private lakeService: LakeService
             , private profilerService:ProfilerService
             ){}

  ngOnInit() {
  	this.lakeService.listWithClusterId().subscribe(lakes => {
  	  this.clusters = lakes;
      this.currentClusterId = lakes[0].clusterId;
  	  this.selectLake(lakes[0]);
	  }); 
  }

  selectLake(lake) {
  	this.selectedLake =lake;
  	this.profilers = [];
  	//TODO send request to fetch list from server
  	this.relodeProfilerStatus();

  	this.senstivityProfilerData = [];
  	//TODO send request to fetch list from server
  	setTimeout(()=>{
  		this.addDisplayDateToSenstivityProfilerData(senstivityProfilerData);
  		this.senstivityProfilerData =senstivityProfilerData;
  	}, 500);
  }

  relodeProfilerStatus () {
    this.profilers = [];
    var d = new Date();
    const endTime = d.getTime();
    d.setHours(0,0,0,0);
    const startTime = d.getTime();

    this.profilerService.getStatusWithAssetsCounts(this.currentClusterId, startTime, endTime)
      .subscribe(infoAndCounts => {
        this.profilers = infoAndCounts
      });
  }

  toggleActive(profiler) {
  	profiler.isActive = !profiler.isActive;
  	//TODO send request to toggle at server as well
  }

  addDisplayDateToSenstivityProfilerData (senstivityProfilerData) {
  	let d=new Date(); d.setDate(d.getDate()-7);
  	senstivityProfilerData.forEach(data=>{
  		data.displayDate=(new Date(d.setDate(d.getDate()+1))).toString().substr(4,6);
  	});
  }
  
}