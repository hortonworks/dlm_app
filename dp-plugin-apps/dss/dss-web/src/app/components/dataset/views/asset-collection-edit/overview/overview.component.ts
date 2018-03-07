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
import {
  Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import {Chart} from 'nvd3';
import * as moment from 'moment';

import {ProfilerService} from '../../../../../services/profiler.service';
import {DssAppEvents} from "app/services/dss-app-events";
import {
  chartColors, ContextTypeConst,
  MetricTypeConst
} from '../../../../../shared/utils/constants';
import {
  MetricContextDefinition, ProfilerMetric,
  ProfilerMetricRequest,
  ProfilerMetricDefinition,
} from '../../../../../models/profiler-metric-request';
import {ActivatedRoute} from '@angular/router';
import {
  AccessPerDayResponse,
  Metric, ProfilerMetricResponse, QueriesAndSensitivityDistributionResponse,
  SensitivityDistributionResponse
} from '../../../../../models/profiler-metric-response';
import {TranslateService} from '@ngx-translate/core';
import {StringUtils} from '../../../../../shared/utils/stringUtils';


declare let d3: any;
declare let nv: any;

@Component({
  selector: 'dss-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnChanges {
  @Input('clusterId') clusterId: number;

  @ViewChild('topUsers') topUsers: ElementRef;
  @ViewChild('sensitiveNonSensitive') sensitiveNonSensitive: ElementRef;
  @ViewChild('distributionByTag') distributionByTag: ElementRef;
  @ViewChild('quiresRunningSensitiveData') quiresRunningSensitiveData: ElementRef;
  @ViewChild('usersAccessingSensitiveData') usersAccessingSensitiveData: ElementRef;

  assetCollectionDashboard = new ProfilerMetricResponse();
  charts: Chart[] = [];
  UNABLE_TO_FETCH_DATA = "Unable to fetch data for plotting the chart";
  NO_DATA = "Data not available for plotting the chart";
  LABEL_LENGTH  = 13;
  sensitivityDistributionData = new SensitivityDistributionResponse(0, 0);

  i18nTablesInAssetCollectionWithTag = '';
  i18nTimesSecureDataAccessed = '';
  i18nUserAccessedAnyData = '';

  constructor(private profileService: ProfilerService,
              private dssAppEvents: DssAppEvents,
              private activatedRoute: ActivatedRoute,
              translate: TranslateService) {
    const i18Keys = [
      'common.unable-to-fetch-chart-data',
      'common.no-chart-data',
      'pages.dataset.asset-collection.times-user-accessed-any-data',
      'pages.dataset.asset-collection.tables-in-asset-collection-with-tag',
      'pages.dataset.asset-collection.times-secure-data-accessed'
    ];
    translate.get(i18Keys).subscribe((res: string[]) => {
      this.UNABLE_TO_FETCH_DATA = res['common.unable-to-fetch-chart-data'];
      this.NO_DATA = res['common.no-chart-data'];
      this.i18nUserAccessedAnyData = res['pages.dataset.asset-collection.times-user-accessed-any-data'];
      this.i18nTablesInAssetCollectionWithTag = res['pages.dataset.asset-collection.tables-in-asset-collection-with-tag'];
      this.i18nTimesSecureDataAccessed = res['pages.dataset.asset-collection.times-secure-data-accessed'];
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['clusterId'].currentValue) {
      this.getData();
    }
  }

  private getData() {
    this.profileService.assetCollectionStats(this.createProfilerMetricRequest()).subscribe(assetCollectionDashboard => {
      this.assetCollectionDashboard = assetCollectionDashboard;
      this.initCharts();
    });
  }

  private createProfilerMetricRequest() {
    const collectionId = this.activatedRoute.snapshot.params['id'];

    const profilerMetricRequest = new ProfilerMetricRequest();
    profilerMetricRequest.clusterId = this.clusterId;

    profilerMetricRequest.context.contextType = ContextTypeConst.COLLECTION;
    profilerMetricRequest.context.definition = new MetricContextDefinition(collectionId);

    profilerMetricRequest.metrics = [
      new ProfilerMetric(MetricTypeConst.TopKUsersPerAssetMetric, new ProfilerMetricDefinition(10, 10)),
      new ProfilerMetric(MetricTypeConst.SensitivityDistributionMetric, new ProfilerMetricDefinition()),
      new ProfilerMetric(MetricTypeConst.SecureAssetAccessUserCountMetric, new ProfilerMetricDefinition(10)),
      new ProfilerMetric(MetricTypeConst.QueriesAndSensitivityDistributionMetric, new ProfilerMetricDefinition(10)),
      new ProfilerMetric(MetricTypeConst.AssetDistributionBySensitivityTagMetric, new ProfilerMetricDefinition(undefined, 10))
    ];
    return profilerMetricRequest;
  }

  private initCharts() {
    this.charts = [] ;

    this.createTopUsersChart();
    this.createSensitiveNonSensitiveChart();
    this.createDistributionByTagChart();
    this.createQuiresRunningSensitiveDataChart();
    this.createUsersAccessingSensitiveDataChart();

    this.dssAppEvents.sideNavCollapsed$.subscribe(collapsed => this.updateChartDimensions());
    this.dssAppEvents.dataSetCollaborationPaneCollapsed$.subscribe(collapsed => this.updateChartDimensions());
  }

  private  createTopUsersChart() {
    let topUsersData = [];
    const metrics = this.assetCollectionDashboard.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.TopKUsersPerAssetMetric)[0];
    if (metrics.status) {
      const metricsChartValues = Object.keys(metrics.definition).map(key => ({'label': key, 'value': metrics.definition[key]}));
      topUsersData = [{'key': this.i18nUserAccessedAnyData, 'color': chartColors.GREEN, 'values': metricsChartValues}];
    }

    nv.addGraph(() => {
      let chart = nv.models.multiBarHorizontalChart()
      .x((d) => {
        return StringUtils.centerEllipses(d.label, this.LABEL_LENGTH);
      })
      .y((d) => {
        return d.value;
      })
      .showValues(false)
      .duration(350)
      .showControls(true)
      .stacked(false)
      .showControls(false)
      .showLegend(false)
      .showYAxis(true)
      .groupSpacing(0.4)
      .margin({left: 85})
      .noData((topUsersData.length > 0 && topUsersData[0].values.length === 0) ? this.NO_DATA : this.UNABLE_TO_FETCH_DATA);

      chart.yAxis.tickFormat(d3.format('f'));

      d3.select(this.topUsers.nativeElement)
      .datum(topUsersData)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createSensitiveNonSensitiveChart() {
    let data = [];
    const metrics = this.assetCollectionDashboard.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.SensitivityDistributionMetric)[0];
    if (metrics.status) {
      this.sensitivityDistributionData = metrics.definition as SensitivityDistributionResponse;
      data = [
          {key: "Sensitive", y: this.sensitivityDistributionData.getSensitiveDataPercentage(), tooltip: this.sensitivityDistributionData.assetsHavingSensitiveData},
          {key: "Non Sensitive", y:  this.sensitivityDistributionData.getNonSensitiveDataPercentage(), tooltip: this.sensitivityDistributionData.getNonSensitiveDataValue()}
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
      .labelType('percent')
      .noData(this.UNABLE_TO_FETCH_DATA);

      chart.pie.labelsOutside(true).donut(true);
      chart.tooltip.valueFormatter((v, i, d) => {
        return data[i].tooltip;
      });

      d3.select(this.sensitiveNonSensitive.nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createDistributionByTagChart() {
    let distributionByTagData = [];
    const metrics = this.assetCollectionDashboard.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.AssetDistributionBySensitivityTagMetric)[0];
    if (metrics.status) {
      const metricsChartValues = Object.keys(metrics.definition).map(key => ({'label': key, 'value': metrics.definition[key]}));
      distributionByTagData = [{'key': this.i18nTablesInAssetCollectionWithTag, 'color': chartColors.GREEN, 'values': metricsChartValues}];
    }

    nv.addGraph(() => {
      const chart = nv.models.multiBarHorizontalChart()
      .x( (d) => {
        return StringUtils.centerEllipses(d.label, this.LABEL_LENGTH);
      })
      .y( (d) => {
        return d.value
      })
      .showValues(false)
      .duration(350)
      .showControls(true)
      .stacked(false)
      .showControls(false)
      .showLegend(false)
      .showYAxis(true)
      .groupSpacing(0.4)
      .margin({left: 85})
      .noData((distributionByTagData.length > 0 && distributionByTagData[0].values.length === 0) ? this.NO_DATA : this.UNABLE_TO_FETCH_DATA);

      chart.yAxis.tickFormat(d3.format('f'));

      d3.select(this.distributionByTag.nativeElement)
      .datum(distributionByTagData)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createQuiresRunningSensitiveDataChart() {
    let data = [];
    const metrics = this.assetCollectionDashboard.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.QueriesAndSensitivityDistributionMetric)[0];
    if (metrics.status) {
      const sensitiveData = metrics.definition as QueriesAndSensitivityDistributionResponse;
      data = [
        {key: "Sensitive", y: sensitiveData.getQuiresRunningOnSensitiveDataPercentage(), tooltip: sensitiveData.queriesRunningOnSensitiveData},
        {key: "Non Sensitive", y:  sensitiveData.getQuiresRunningOnNonSensitiveDataPercentage(), tooltip: sensitiveData.getQuiresRunningOnNonSensitiveDataValue()}
      ];
    }

    nv.addGraph(() => {
      const chart = nv.models.pieChart()
      .x(function (d) {
        return d.key
      })
      .y(function (d) {
        return d.y
      })
      .donut(true)
      .title('')
      .color([chartColors.GREEN, chartColors.BLUE])
      .valueFormat((val) => `${val}%`)
      .labelType('percent')
      .noData(this.UNABLE_TO_FETCH_DATA);

      chart.pie.labelsOutside(true).donut(true);
      chart.tooltip.valueFormatter((v, i, d) => {
        return data[i].tooltip;
      });

      d3.select(this.quiresRunningSensitiveData.nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createUsersAccessingSensitiveDataChart() {
    let data = [];
    const metrics = this.assetCollectionDashboard.metrics.filter((metric: Metric) => metric.metricType === MetricTypeConst.SecureAssetAccessUserCountMetric)[0];
    if (metrics.status) {
      const metricValues = metrics.definition as AccessPerDayResponse[];
      const metricsChartValues = metricValues.map((key) => ({'x': moment(key.date, 'YYYY-MM-DD').valueOf(), 'y': key.numberOfAccesses}));
      data = [{
          area: true,
          values: metricsChartValues,
          key: this.i18nTimesSecureDataAccessed,
          color: chartColors.GREEN,
          fillOpacity: .1
      }];
    }

    nv.addGraph(() => {
      const chart = nv.models.lineChart()
      .options({
        duration: 300,
        useInteractiveGuideline: true,
        showLegend: false
      })
      .margin({left: 0})
      .noData((data.length > 0 && data[0].values.length === 0) ? this.NO_DATA : this.UNABLE_TO_FETCH_DATA);

      chart.xAxis.tickFormat(function(d) {
        return d3.time.format('%m/%d/%y')(new Date(d))
      });
      chart.yAxis.tickFormat(d3.format(',d'));

      d3.select(this.usersAccessingSensitiveData.nativeElement)
      .datum(data)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private updateChartDimensions() {
    this.charts.forEach(chart => chart.update());
  }
}
