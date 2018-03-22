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
import { Lake } from '../../../../models/lake';
import {ProfilerModel, ProfilerInfoWithAssetsCount} from '../../../../models/profiler-models';

import {chartColors, ContextTypeConst, MetricTypeConst} from '../../../../shared/utils/constants';
import {
  MetricContextDefinition, ProfilerMetric,
  ProfilerMetricDefinition, ProfilerMetricRequest
} from "app/models/profiler-metric-request";

@Component({
  selector: 'profilers-configs-dashboard',
  templateUrl: './configs.component.html',
  styleUrls: ['./configs.component.scss']
})

export class ProfilerConfigsComponent implements OnInit {
  
  clusters = [];
  selectedLake:Lake = null;
  profilers:Array<ProfilerInfoWithAssetsCount> = [];
  selectedProfiler:ProfilerInfoWithAssetsCount = null;
  senstivityProfilerData = [];

  profilerHistoryData = [];
  historiesResp = null;
  assetMatricResp = null;

  constructor( private lakeService: LakeService
             , private profilerService:ProfilerService
             ){}

  ngOnInit() {
  	this.lakeService.listWithClusterId().subscribe(lakes => {
      lakes = lakes.sort((a, b) => a.name.localeCompare(b.name));
  	  this.clusters = lakes;
  	  this.selectLake(lakes[0]);
	  }); 
  }

  selectLake(lake) {
  	this.selectedLake =lake;
  	this.profilers = [];
    this.selectedProfiler = null;
    this.reloadAssetMatric();
    this.relodeProfilersStatus();
  }

  relodeProfilersStatus () {
    this.profilers = [];

    var d = new Date();
    const endTime = d.getTime();
    d.setHours(0,0,0,0);
    const startTime = d.getTime();

    this.profilerService
      .getStatusWithAssetsCounts(this.selectedLake.clusterId, startTime, endTime)
      .subscribe(infoAndCounts => {
        this.profilers = infoAndCounts
        this.selectedProfiler = infoAndCounts[0];
        this.loadProfilerHistories();
      });
  }

  loadProfilerHistories () {
    this.historiesResp = null;
    this.profilerHistoryData = null;

    var d = new Date();
    const endTime = d.getTime();
    d.setHours(-24*6,0,0,0);
    const startTime = d.getTime();

    this.profilerService
      .getProfilerHistories(this.selectedLake.clusterId, this.selectedProfiler.profilerInfo.name, startTime, endTime)
      .subscribe(histories => {
        this.historiesResp = histories;
        this.prepareProfilerHistoryData();
      })
  }

  prepareProfilerHistoryData () {
    if(!this.assetMatricResp || !this.historiesResp) return;
    this.profilerHistoryData = [];
    for(var i=6; i > 0; i--) {
      let d = new Date(), dStr = this.formatDate(d.setDate(d.getDate()-i));
      let data = this.historiesResp.find(obj => obj.day === dStr)
      let mData = this.assetMatricResp.find(obj => obj.date === dStr)
      let status = (!data || !data.assetsCount.SUCCESS)?"failed":(data.assetsCount.FAILED)?"somePass":"allPass";
      let percent = (!data || !mData)? "-": (Math.floor(100 * data.assetsCount.SUCCESS / mData.totalAssets) + "%");
      let displayDate=(new Date(d.setDate(d.getDate()))).toString().substr(4,6);

      this.profilerHistoryData.push({"day":dStr, "status":status, "assetsProfiled":percent, "displayDate":displayDate});
    }
    console.log(this.profilerHistoryData);
  }

  toggleActive(profiler: ProfilerModel) {
  	profiler.active = !profiler.active;
    this.profilerService
      .putProfilerState(this.selectedLake.clusterId, profiler.name, profiler.active)
      .subscribe(resp => profiler.active = resp.state);
  }
  changeProfiler(profiler: ProfilerInfoWithAssetsCount) {
    this.selectedProfiler = profiler;
    this.loadProfilerHistories();
  }

  private createProfilerMetricRequest(metrics: ProfilerMetric[]) {
    const profilerMetricRequest = new ProfilerMetricRequest();
    profilerMetricRequest.clusterId = this.selectedLake.clusterId;

    profilerMetricRequest.context.contextType = ContextTypeConst.CLUSTER;

    profilerMetricRequest.metrics = metrics;
    return profilerMetricRequest;
  }

  private reloadAssetMatric() {

    var d = new Date();
    const endTime = d.getTime();
    d.setHours(-24*6,0,0,0);
    const startTime = d.getTime();

    const metricsRequests = this.createProfilerMetricRequest([
      new ProfilerMetric(MetricTypeConst.AssetCounts, new ProfilerMetricDefinition(undefined, this.formatDate(startTime), this.formatDate(endTime)))
    ]);

    this.assetMatricResp = null;
    this.profilerService.assetCollectionStats(metricsRequests).subscribe(data => {
      this.assetMatricResp = data.metrics[0].definition['assetsAndCount'];
      this.prepareProfilerHistoryData();
    });
  }

  private formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  
}