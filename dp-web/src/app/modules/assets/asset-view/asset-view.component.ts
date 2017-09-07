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
import {ActivatedRoute, RouterModule, Routes} from '@angular/router';

import {AssetService} from '../../../services/asset.service';
import {TabStyleType} from '../../../shared/tabs/tabs.component';
import {NodeDetailsComponent} from './node-details/node-details.component'
import {AssetDetails, AssetProperty} from '../../../models/asset-property';


export enum TopLevelTabs {
  DETAILS, LINEAGE, POLICY, AUDIT//, REPLICATION
}

enum ProfilerStatus {
  UNKNOWN, NOSUPPORT, NOTSTARTED, RUNNING, SUCCESS, FAILED
}

@Component({
  selector: 'dp-asset-view',
  templateUrl: './asset-view.component.html',
  styleUrls: ['./asset-view.component.scss']
})

export class AssetViewComponent implements OnInit {
  tabType = TabStyleType;
  topLevelTabs = TopLevelTabs;

  selectedTopLevelTabs = TopLevelTabs.DETAILS;

  assetDetails: AssetDetails;

  clusterId: string;
  guid: string;
  tableName: string;
  databaseName: string;
  summary: AssetProperty[] = [];
  jobId:number = null;
  PS = ProfilerStatus;
  profilerStatus:ProfilerStatus = this.PS.UNKNOWN;
  lastRunTime:string = "";
  nextRunTime:number = 0;
  nextRunDisplay:string = "";

  constructor(private route: ActivatedRoute, private assetService: AssetService) {
  }

  ngOnInit() {
    this.clusterId = this.route.snapshot.params['id'];
    this.guid = this.route.snapshot.params['guid'];
    this.assetService.getDetails(this.clusterId, this.guid).subscribe(details => {
      if (details.entity['typeName'] && details.entity['typeName'] !== 'hive_table') {
        return;
      }
      this.assetDetails = details;
      this.summary = this.extractSummary(details.entity);
      this.getProfilingJobStatus();
    });
    this.assetService.getDetailsFromDb(this.guid).subscribe(details => {
      this.assetService.getScheduleInfo(details.clusterId, details.datasetId).subscribe(res=>{
        this.nextRunTime = Math.max(0,parseInt(res['nextFireTime']) - Date.now());
        var nrtMin = Math.floor(this.nextRunTime/60000); //in minutes;
        var nrtHour = (nrtMin > 60)?Math.floor(nrtMin/60):0;
        this.nextRunDisplay = "Next Profiler Schedule in : " + ((nrtHour)?(nrtHour + ((nrtHour==1)?" hour":" hours")):(nrtMin + ((nrtMin==1)?" minute":" minutes")));
        console.log(this.nextRunDisplay);
      },
      err =>
          ((err.status === 404) && (console.log("404 from getScheduleInfo")))
        ||((err.status === 405) && (console.log("405 from getScheduleInfo")))
      );
    });
  }

  get showProfilerStatus() {
    return (this.profilerStatus != this.PS.NOSUPPORT && this.profilerStatus != this.PS.UNKNOWN);
  }

  get showLastRunTime () {
    return (this.lastRunTime && this.showProfilerStatus && this.profilerStatus != this.PS.RUNNING);
  }

  getProfilingJobStatus () {
    this.assetService.getProfilingStatus(this.clusterId, this.databaseName, this.tableName).subscribe(res=>{
      this.lastRunTime = (new Date(res.time)).toLocaleString();
      switch(res.status) {
          case "SUCCESS" : this.profilerStatus = this.PS.SUCCESS; break;
          case "FAILED"  : this.profilerStatus = this.PS.FAILED;  break;
          case "STARTED" : this.profilerStatus = this.PS.RUNNING;
                           setTimeout(()=>this.getProfilingJobStatus(), 5000);
                           break;
      }
    },
    err =>
        ((err.status === 404) && (this.profilerStatus = this.PS.NOTSTARTED))
      ||((err.status === 405) && (this.profilerStatus = this.PS.NOSUPPORT))
    );
  }

  startProfiler() {
    if (this.profilerStatus == this.PS.RUNNING) return;
    this.profilerStatus = this.PS.RUNNING;
    this.assetService.startProfiling(this.clusterId, this.databaseName, this.tableName).subscribe(
      res=>(this.jobId = res.id) && this.getProfilingJobStatus(),
      err => (err.status === 405) && (this.profilerStatus = this.PS.NOSUPPORT)
    );
  }

  private extractSummary(entity) {
    let summary: AssetProperty[] = [];
    let qualifiedName = entity.attributes.qualifiedName;
    this.tableName = qualifiedName.slice(qualifiedName.indexOf('.') + 1, qualifiedName.indexOf('@'));
    this.databaseName = qualifiedName.slice(0, qualifiedName.indexOf('.'));
    summary.push(new AssetProperty('Datalake', qualifiedName.slice(qualifiedName.indexOf('@') + 1, qualifiedName.length)));
    summary.push(new AssetProperty('Database', this.databaseName));
    let rowCount = 'NA';
    if (entity.attributes.profileData && entity.attributes.profileData.attributes) {
      rowCount = entity.attributes.profileData.attributes.rowCount;
    }
    summary.push(new AssetProperty('# of Rows', rowCount));

    return summary;
  }

}

