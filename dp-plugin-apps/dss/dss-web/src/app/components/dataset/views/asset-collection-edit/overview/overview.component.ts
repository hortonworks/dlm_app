import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'nvd3';

import {ProfilerService} from '../../../../../services/profiler.service';
import {AssetCollectionDashboard} from '../../../../../models/asset-collection-dashboard';
import {DssAppEvents} from "app/services/dss-app-events";

declare let d3: any;
declare let nv: any;

@Component({
  selector: 'dss-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  @ViewChild('topUsers') topUsers: ElementRef;
  @ViewChild('sensitiveNonSensitive') sensitiveNonSensitive: ElementRef;
  @ViewChild('distributionByTag') distributionByTag: ElementRef;
  @ViewChild('quiresRunningSensitiveData') quiresRunningSensitiveData: ElementRef;
  @ViewChild('usersAccessingSensitiveData') usersAccessingSensitiveData: ElementRef;

  assetCollectionDashboard = new AssetCollectionDashboard();
  charts: Chart[] = [];

  constructor(private profileService: ProfilerService,
              private dssAppEvents: DssAppEvents) { }

  ngOnInit() {
    this.profileService.assetCollectionStats().subscribe(assetCollectionDashboard => {
      this.assetCollectionDashboard = assetCollectionDashboard;
      this.initCharts()
    });
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

  private createTopUsersChart() {
    const topUsersData = [
      {
        'key': '',
        'color': '#2DB075',
        'values': this.assetCollectionDashboard.topUsers.stats.map(stat => ({'label': stat.key, 'value': stat.value}))
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
      .groupSpacing(0.4)
      .margin({left: 85});

      d3.select(this.topUsers.nativeElement)
      .datum(topUsersData)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createSensitiveNonSensitiveChart() {
    const data = this.assetCollectionDashboard.sensitiveAndNonSensitive.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
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
      .labelFormat((val) => `${val}%`)
      .labelType('percent');

      chart.pie.labelsOutside(true).donut(true);

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
    const distributionByTagData = [
      {
        'key': '',
        'color': '#2DB075',
        'values': this.assetCollectionDashboard.assetDistribution.stats.map(stat => ({'label': stat.key, 'value': stat.value}))
      }
    ];
    nv.addGraph(() => {
      const chart = nv.models.multiBarHorizontalChart()
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
      .groupSpacing(0.4)
      .margin({left: 85});

      d3.select(this.distributionByTag.nativeElement)
      .datum(distributionByTagData)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createQuiresRunningSensitiveDataChart() {
    const data = this.assetCollectionDashboard.quiresRunningSensitiveData.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
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
      .color(['#2DB075', '#2891C0'])
      .labelFormat((val) => `${val}%`)
      .labelType('percent');

      chart.pie.labelsOutside(true).donut(true);

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
    nv.addGraph(() => {
      const chart = nv.models.lineChart()
      .options({
        duration: 300,
        useInteractiveGuideline: true,
        showLegend: false
      });

      chart.xAxis.tickFormat(function(d) {
        return d3.time.format('%m/%d/%y')(new Date(d))
      });
      chart.yAxis.tickFormat(d3.format(',d'));

      let data = [
        {
          area: true,
          values: this.assetCollectionDashboard.usersAccessingSecureData.stats.map(stat => ({'x': stat.key, 'y': stat.value})),
          key: 'User Accessing Secure Data',
          color: '  #2DB075',
          fillOpacity: .1
        }
      ];
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
