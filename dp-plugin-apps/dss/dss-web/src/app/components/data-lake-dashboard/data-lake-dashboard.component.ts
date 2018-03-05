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

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'nvd3';

import {ActivatedRoute, Router} from '@angular/router';
import {ProfilerService} from 'app/services/profiler.service';
import {DataLakeDashboard} from '../../models/data-lake-dashboard';
import {chartColors} from '../../shared/utils/constants';
import {DssAppEvents} from '../../services/dss-app-events';

declare let d3: any;
declare let nv: any;

@Component({
  selector: 'dss-data-lake-dashboard',
  templateUrl: './data-lake-dashboard.component.html',
  styleUrls: ['./data-lake-dashboard.component.scss']
})

export class DataLakeDashboardComponent implements OnInit {

  @ViewChild('totalAssets') totalAssets: ElementRef;
  @ViewChild('profiledNonProfiled') profiledNonProfiled: ElementRef;
  @ViewChild('sensitiveData') sensitiveData: ElementRef;
  @ViewChild('profilerJobs') profilerJobs: ElementRef;
  @ViewChild('secureData') secureData: ElementRef;
  @ViewChild('topAssetCollections') topAssetCollections: ElementRef;
  @ViewChild('topAssets') topAssets : ElementRef;

  dataLakeDashboardData: DataLakeDashboard = new DataLakeDashboard();
  private charts: Chart[] = [];

  constructor(private router: Router,
              private activeRoute: ActivatedRoute,
              private profileService: ProfilerService,
              private dssAppEvents: DssAppEvents) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      const dataLakeId = params['id'];
      if (String(dataLakeId) === 'undefined') {
        this.redirectToRoot();
      } else {
        this.getDataLakeDashboardData(dataLakeId);
      }
    });
  }

  redirectToRoot() {
    this.router.navigateByUrl('/dss');
  }

  getDataLakeDashboardData(dataLakeId: number) {
    this.profileService.dataLakeStats(dataLakeId).subscribe(data => {
      this.dataLakeDashboardData = data;
      this.initCharts();
    });

    this.dssAppEvents.sideNavCollapsed$.subscribe(collapsed => this.updateChartDimensions());
  }

  private initCharts() {
    this.createTotalAssetsChart();
    this.createProfiledNonProfiledChart();
    this.createSensitiveDataChart();
    this.createProfilerJobsChart();
    this.createSecureDataChart();
    this.createTopAssetCollectionsChart();
    this.createTopAssetsChart();
  }

  private createTotalAssetsChart() {
    const newAssetCount = [];
    let prevVal = this.dataLakeDashboardData.assetCountHistogram.stats[0].value;
    for (let i = 0; i < this.dataLakeDashboardData.assetCountHistogram.stats.length; i++) {
      let newCount = this.dataLakeDashboardData.assetCountHistogram.stats[i].value - prevVal;
      prevVal = this.dataLakeDashboardData.assetCountHistogram.stats[i].value;
      newAssetCount.push({'x': this.dataLakeDashboardData.assetCountHistogram.stats[i].key, 'y': (newCount > 0 ? newCount : 0)});
    }

    const test_data = [
        {'key':'Existing','nonStackable':false, 'values': this.dataLakeDashboardData.assetCountHistogram.stats.map(stat => ({x: stat.key, y: stat.value}))},
        {'key':'New','nonStackable':false, 'values': newAssetCount}
    ];

    const that = this;
    nv.addGraph(() => {
      const chart = nv.models.multiBarChart()
      .stacked(true)
      .showControls(false)
      .showYAxis(false)
      .color([chartColors.GREEN, chartColors.RED])
      .groupSpacing(.4)
      .reduceXTicks(false)

      const svg = d3.select(that.totalAssets.nativeElement).datum(test_data);
      svg.transition().duration(0).call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createProfiledNonProfiledChart() {
    const data = this.dataLakeDashboardData.profiledNonProfiled.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
    nv.addGraph(() => {
      let chart = nv.models.pieChart()
      .x(function (d) {
        return d.key
      })
      .y(function (d) {
        return d.y
      })
      .donut(true)
      .color(['#2DB075', '#2891C0'])
      .valueFormat((val) => `${val}%`)
      .labelType('percent');

      chart.pie.labelsOutside(true).donut(true);

      d3.select(this.profiledNonProfiled.nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createSensitiveDataChart() {
    const data = this.dataLakeDashboardData.sensitiveNonSensitive.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
    nv.addGraph(() => {
      let chart = nv.models.pieChart()
      .x(function (d) {
        return d.key
      })
      .y(function (d) {
        return d.y
      })
      .donut(true)
      .color([chartColors.GREEN, chartColors.BLUE])
      .valueFormat((val) => `${val}%`)
      .labelType('percent');

      chart.pie.labelsOutside(true).donut(true);

      d3.select(this.sensitiveData .nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createProfilerJobsChart() {
    const data = this.dataLakeDashboardData.profilerJobs.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
    nv.addGraph(() => {
      let chart = nv.models.pieChart()
      .x(function (d) {
        return d.key
      })
      .y(function (d) {
        return d.y
      })
      .donut(true)
      .color([chartColors.GREEN, chartColors.BLUE, chartColors.RED])
      .valueFormat((val) => `${val}%`)
      .labelType('percent');

      chart.pie.labelsOutside(true).donut(true);

      d3.select(this.profilerJobs .nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createSecureDataChart() {
    const data = this.dataLakeDashboardData.secureData.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
    nv.addGraph(() => {
      let chart = nv.models.pieChart()
      .x(function (d) {
        return d.key
      })
      .y(function (d) {
        return d.y
      })
      .donut(true)
      .color([chartColors.GREEN, chartColors.BLUE, chartColors.RED])
      .valueFormat((val) => `${val}%`)
      .labelType('percent');

      chart.pie.labelsOutside(true).donut(true);

      d3.select(this.secureData .nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createTopAssetCollectionsChart() {
    const topUsersData = [
      {
        'key': '',
        'color': chartColors.GREEN,
        'values': this.dataLakeDashboardData.topAssetCollections.stats.map(stat => ({'label': stat.key, 'value': stat.value}))
      }
    ];
    let chart;
    nv.addGraph(() => {
      chart = nv.models.multiBarHorizontalChart()
      .x(function (d) {
        return d.label
      })
      .y(function (d) {
        return d.value
      })
      .showValues(false)
      .duration(350)
      .stacked(false)
      .showControls(false)
      .showLegend(false)
      .showYAxis(true)
      .groupSpacing(0.2)
      .margin({left: 85});

      chart.dispatch.on('renderEnd', () => {
        this.renderLockIcon(this.topAssetCollections);
      });

      d3.select(this.topAssetCollections.nativeElement)
      .datum(topUsersData)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      d3.selectAll(this.topAssetCollections.nativeElement).selectAll("foreignObject").data([1]).enter().append(() => {
        const f = document.createElementNS('http://www.w3.org/2000/svg',"foreignObject");
        f.setAttribute('x', '0');
        f.setAttribute('y', '0');
        f.setAttribute('height', '18');
        f.setAttribute('width', '90');
        f.setAttribute('style', 'stroke: black');
        f.innerHTML = '<div style=""><i class="fa fa-lock" style="margin-left: 5px;margin-top: 4px;font-weight: 900;"></i></div>';
        return f;
      });

      return chart;
    });
  }

  private createTopAssetsChart() {
    const topUsersData = [
      {
        'key': '',
        'color': chartColors.GREEN,
        'values': this.dataLakeDashboardData.topAssets.stats.map(stat => ({'label': stat.key, 'value': stat.value}))
      }
    ];
    let chart;
    nv.addGraph(() => {
      chart = nv.models.multiBarHorizontalChart()
      .x(function (d) {
        return d.label
      })
      .y(function (d) {
        return d.value
      })
      .showValues(false)
      .duration(350)
      .showControls(true)
      .stacked(false)
      .showControls(false)
      .showLegend(false)
      .showYAxis(true)
      .groupSpacing(0.2)
      .margin({left: 85});

      chart.dispatch.on('renderEnd', () => {
        this.renderLockIcon(this.topAssets);
      });

      d3.select(this.topAssets.nativeElement)
      .datum(topUsersData)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private renderLockIcon(element : ElementRef) {
    d3.select(element.nativeElement).selectAll('.nv-bar').selectAll("foreignObject").data([1]).enter().append(() => {
      const f = document.createElementNS('http://www.w3.org/2000/svg', "foreignObject");
      f.setAttribute('x', '0');
      f.setAttribute('y', '0');
      f.setAttribute('height', '18');
      f.setAttribute('width', '90');
      f.setAttribute('style', 'stroke: black');
      f.innerHTML = '<div style=""><i class="fa fa-lock" style="margin-left: 5px;margin-top: 4px;font-weight: 900;"></i></div>';
      return f;
    });
  }

  private updateChartDimensions() {
    this.charts.forEach(chart => chart.update());
  }
}
