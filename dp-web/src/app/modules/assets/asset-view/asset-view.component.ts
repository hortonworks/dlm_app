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

