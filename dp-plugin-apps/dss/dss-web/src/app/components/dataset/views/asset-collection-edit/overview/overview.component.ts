import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {color} from 'd3';
import {ProfilerService} from '../../../../../services/profiler.service';
import {AssetCollectionDashboard} from '../../../../../models/asset-collection-dashboard';

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

  constructor(private profileService: ProfilerService) { }

  ngOnInit() {
    this.profileService.assetCollectionStats().subscribe(assetCollectionDashboard => {
      this.assetCollectionDashboard = assetCollectionDashboard;
      this.initCharts()
    });
  }

  private initCharts() {
    this.createTopUsersChart();
    this.createSensitiveNonSensitiveChart();
    this.createDistributionByTagChart();
    this.createQuiresRunningSensitiveDataChart();
    this.createUsersAccessingSensitiveDataChart();
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
      .groupSpacing(0.4);

      // chart.yAxis.tickFormat(d3.format(',.2f'));

      d3.select(this.topUsers.nativeElement)
      .datum(topUsersData)
      .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  }

  private createSensitiveNonSensitiveChart() {
    const data = this.assetCollectionDashboard.sensitiveAndNonSensitive.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
    nv.addGraph(() => {
      let chart1 = nv.models.pieChart()
      .x(function (d) {
        return d.key
      })
      .y(function (d) {
        return d.y
      })
      .donut(true)
      .color(['#2DB075', '#2891C0']);

      chart1.pie.labelsOutside(true).donut(true);

      d3.select(this.sensitiveNonSensitive.nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart1);

      return chart1;
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
      .groupSpacing(0.4);

      d3.select(this.distributionByTag.nativeElement)
      .datum(distributionByTagData)
      .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  }

  private createQuiresRunningSensitiveDataChart() {
    const data = this.assetCollectionDashboard.quiresRunningSensitiveData.stats.map(stat => ({'key': stat.key, 'y': stat.value}));
    nv.addGraph(() => {
      const chart1 = nv.models.pieChart()
      .x(function (d) {
        return d.key
      })
      .y(function (d) {
        return d.y
      })
      .donut(true)
      .title('')
      .color(['#2DB075', '#2891C0']);

      chart1.pie.labelsOutside(true).donut(true);

      d3.select(this.quiresRunningSensitiveData.nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart1);

      return chart1;
    });
  }

  private createUsersAccessingSensitiveDataChart() {

    let chart;
    let data;

    nv.addGraph(() => {
      chart = nv.models.lineChart()
      .options({
        duration: 300,
        useInteractiveGuideline: true,
        showLegend: false
      });

      chart.xAxis.tickFormat(function(d) {
        return d3.time.format('%m/%d/%y')(new Date(d))
      });
      chart.yAxis.tickFormat(d3.format(',d'));

      data = [
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
      return chart;
    });
  }
}
