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
import {chartColors, ContextTypeConst, MetricTypeConst} from '../../shared/utils/constants';
import {DssAppEvents} from '../../services/dss-app-events';
import {
  MetricContextDefinition, ProfilerMetric,
  ProfilerMetricDefinition, ProfilerMetricRequest
} from "app/models/profiler-metric-request";
import {
  AssetsAndCount, Metric,
  ProfilerMetricResponse,
  AssetCountsResultForADay, CollectionsAndCount, SensitivityDistributionResponse
} from '../../models/profiler-metric-response';
import {DomUtils} from '../../shared/utils/dom-utils';

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

  clusterId: number;
  metricTypeConst = MetricTypeConst;
  dataLakeDashboardData: DataLakeDashboard = new DataLakeDashboard();
  sensitivityDistributionData = new  SensitivityDistributionResponse(0, 0);
  private charts: Chart[] = [];

  constructor(private router: Router,
              private activeRoute: ActivatedRoute,
              private profileService: ProfilerService,
              private dssAppEvents: DssAppEvents) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      this.clusterId = parseInt(params['id']);
      if (String(this.clusterId) === 'undefined') {
        this.redirectToRoot();
      } else {
        this.getDataLakeDashboardData(this.clusterId);
      }
    });
  }

  redirectToRoot() {
    this.router.navigateByUrl('/dss');
  }

  getDataLakeDashboardData(dataLakeId: number) {
    const metricsRequests = this.createProfilerMetricRequest([
      new ProfilerMetric(MetricTypeConst.SensitivityDistributionMetric, new ProfilerMetricDefinition())
    ]);

    this.profileService.assetCollectionStats(metricsRequests).subscribe(assetCollectionDashboard => {
      this.initCharts(assetCollectionDashboard);
    });

    this.dssAppEvents.sideNavCollapsed$.subscribe(collapsed => this.updateChartDimensions());
  }

  private initCharts(profilerMetricResponse: ProfilerMetricResponse) {
    this.createProfiledNonProfiledChart();
    this.createSensitiveDataChart(profilerMetricResponse);
    this.createProfilerJobsChart();

    // this.createTotalAssetsChart();
    // this.createTopAssetCollectionsChart();
    // this.createTopAssetsChart();
  }

  private createSensitiveDataChart(profilerMetricResponse: ProfilerMetricResponse) {
    this.sensitiveData.nativeElement.classList.remove('loader');

    let data = [];
    const metrics = profilerMetricResponse.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.SensitivityDistributionMetric)[0];
    if (metrics.status) {
      this.sensitivityDistributionData = metrics.definition as SensitivityDistributionResponse;
      const sensitiveDataPercentage = SensitivityDistributionResponse.getSensitiveDataPercentage(this.sensitivityDistributionData);
      const nonSensitiveDataPercentage = SensitivityDistributionResponse.getNonSensitiveDataPercentage(this.sensitivityDistributionData);
      const nonSensitiveDataValue = SensitivityDistributionResponse.getNonSensitiveDataValue(this.sensitivityDistributionData);
      const sensitiveDataValue = this.sensitivityDistributionData.assetsHavingSensitiveData;
      data = [
        {key: "Sensitive", y: sensitiveDataPercentage, tooltip: sensitiveDataValue},
        {key: "Non Sensitive", y:  nonSensitiveDataPercentage, tooltip: nonSensitiveDataValue}
      ];
    }

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
      chart.tooltip.valueFormatter((v, i, d) => {
        return data[i].tooltip;
      });

      d3.select(this.sensitiveData .nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createProfilerMetricRequest(metrics: ProfilerMetric[]) {
    const profilerMetricRequest = new ProfilerMetricRequest();
    profilerMetricRequest.clusterId = this.clusterId;

    profilerMetricRequest.context.contextType = ContextTypeConst.CLUSTER;

    profilerMetricRequest.metrics = metrics;
    return profilerMetricRequest;
  }

  private getAssetCounts(startDate: string, endDate: string) {
    const metricsRequests = this.createProfilerMetricRequest([
      new ProfilerMetric(MetricTypeConst.AssetCounts, new ProfilerMetricDefinition(undefined, startDate, endDate))
    ]);

    this.totalAssets.nativeElement.classList.add('loader');

    this.profileService.assetCollectionStats(metricsRequests).subscribe(assetCollectionDashboard => {
      this.createAssetCountChart(assetCollectionDashboard)
    });
  }

  private createAssetCountChart(profilerMetricResponse: ProfilerMetricResponse) {
    this.totalAssets.nativeElement.classList.remove('loader');
    DomUtils.removeAllChildNodes(this.totalAssets.nativeElement);

    let assetCounts = [], newAssetCount = [];
    const metrics = profilerMetricResponse.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.AssetCounts)[0];
    if (metrics.status) {
      const data = metrics.definition as AssetsAndCount;
      const assetsAndCount = data.assetsAndCount as AssetCountsResultForADay[];
      assetsAndCount.forEach(ac => {
        assetCounts.push({'x': ac.date , 'y': ac.totalAssets});
        newAssetCount.push({'x': ac.date , 'y': ac.newAssets});
      });
    }

    const data = [
      {'key':'Existing','nonStackable':false, 'values': assetCounts},
      {'key':'New','nonStackable':false, 'values': newAssetCount}
    ];

    nv.addGraph(() => {
      const chart = nv.models.multiBarChart()
      .stacked(true)
      .showControls(false)
      .showYAxis(false)
      .color([chartColors.GREEN, chartColors.RED])
      .groupSpacing(.4)
      .height(320)
      .reduceXTicks(false);

      const svg = d3.select(this.totalAssets.nativeElement).datum(data);
      svg.transition().duration(0).call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createProfiledNonProfiledChart() {
    this.profiledNonProfiled.nativeElement.classList.remove('loader');

    const data = DataLakeDashboard.getData().profiledNonProfiled.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
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

  private createProfilerJobsChart() {
    this.profilerJobs.nativeElement.classList.remove('loader');

    const data = DataLakeDashboard.getData().profilerJobs.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
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

  private getTopKCollections(startDate: any, endDate: any) {
    const metricsRequests = this.createProfilerMetricRequest([
      new ProfilerMetric(MetricTypeConst.TopKCollections, new ProfilerMetricDefinition(10, startDate, endDate))
    ]);

    this.topAssetCollections.nativeElement.classList.add('loader');

    this.profileService.assetCollectionStats(metricsRequests).subscribe(assetCollectionDashboard => {
      this.createTopKCollectionssChart(assetCollectionDashboard)
    });
  }

  private createTopKCollectionssChart(profilerMetricResponse: ProfilerMetricResponse) {
    this.topAssetCollections.nativeElement.classList.remove('loader');
    DomUtils.removeAllChildNodes(this.topAssetCollections.nativeElement);

    let data = [];
    const metrics = profilerMetricResponse.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.TopKCollections)[0];
    if (metrics.status) {
      const definition = metrics.definition as CollectionsAndCount;
      const assetsAndCount = definition.collectionsAndCount as {[p: string]: Number};
      data = Object.keys(assetsAndCount).map(k => ({'label': k, 'value': assetsAndCount[k]}));
    }

    const topUsersData = [
      {
        'key': '',
        'color': chartColors.GREEN,
        'values': data
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

  private getTopKAssets(startDate: string, endDate: string) {
    const metricsRequests = this.createProfilerMetricRequest([
      new ProfilerMetric(MetricTypeConst.TopKAssets, new ProfilerMetricDefinition(10, startDate, endDate))
    ]);

    this.topAssets.nativeElement.classList.add('loader');

    this.profileService.assetCollectionStats(metricsRequests).subscribe(assetCollectionDashboard => {
      this.createTopKAssetsChart(assetCollectionDashboard)
    });
  }

  private createTopKAssetsChart(profilerMetricResponse: ProfilerMetricResponse) {
    this.topAssets.nativeElement.classList.remove('loader');
    DomUtils.removeAllChildNodes(this.topAssets.nativeElement);

    let data = [];
    const metrics = profilerMetricResponse.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.TopKAssets)[0];
    if (metrics.status) {
      const definition = metrics.definition as AssetsAndCount;
      const assetsAndCount = definition.assetsAndCount as {[p: string]: Number};
      data = Object.keys(assetsAndCount).map(k => ({'label': k, 'value': assetsAndCount[k]}));
    }

    const topUsersData = [
      {
        'key': '',
        'color': chartColors.GREEN,
        'values': data
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

  timeRangeChange($event, type: string) {
    if (type === MetricTypeConst.AssetCounts) {
      this.getAssetCounts($event[0], $event[1]);
    }

    if (type === MetricTypeConst.TopKAssets) {
      this.getTopKAssets($event[0], $event[1]);
    }

    if (type === MetricTypeConst.TopKCollections) {
      this.getTopKCollections($event[0], $event[1]);
    }
  }
}
