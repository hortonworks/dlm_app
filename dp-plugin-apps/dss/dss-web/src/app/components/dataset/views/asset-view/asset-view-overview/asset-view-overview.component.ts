import {
  Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import {chartColors} from '../../../../../shared/utils/constants';
import faker from 'faker';
import {StringUtils} from '../../../../../shared/utils/stringUtils';
import {DssAppEvents} from '../../../../../services/dss-app-events';
import {LineageComponent} from '../../../../../shared/lineage/lineage.component';
import {AssetDetails} from '../../../../../models/asset-property';

declare const d3: any;
declare const nv: any;

@Component({
  selector: 'dss-asset-view-overview',
  templateUrl: './asset-view-overview.component.html',
  styleUrls: ['./asset-view-overview.component.scss']
})

export class AssetViewOverviewComponent implements OnChanges {
  @Input() guid = '1cb2fd1e-03b4-401f-a587-2151865d375a';
  @Input() clusterId = '1989';
  @Input() assetDetails = new AssetDetails();

  @ViewChild('topUsers') topUsers: ElementRef;
  @ViewChild('authUnauthorisedAccess') authUnauthorisedAccess: ElementRef;
  @ViewChild('selectAndUpdate') selectAndUpdate: ElementRef;
  @ViewChild(LineageComponent) lineageComponent: LineageComponent;

  LABEL_LENGTH = 13;

  private charts = [];

  constructor(private dssAppEvents: DssAppEvents) {
    this.dssAppEvents.sideNavCollapsed$.subscribe(() => this.updateChartDimensions());
    this.dssAppEvents.assetCollaborationPaneCollapsed$.subscribe(() => this.updateChartDimensions());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['guid'] && changes['guid'].currentValue.length > 0) {
      this.initCharts();
    }
  }

  private initCharts() {
    this.createTopAssetsChart();
    this.createAuthorisedAndUnAuthorisedChart();
    this.createSelectAndUpdate();
  }

  private createTopAssetsChart() {
    let prevVal = 0;
    const mockData = Array.apply(null, {length: 10}).map(function(value, index){
      prevVal = faker.random.number({min: prevVal});
      return {'label': faker.name.findName(), 'value': prevVal};
    }).reverse();

    const topUsersData = [
      {
        'key': '',
        'color': chartColors.GREEN,
        'values': mockData
      }
    ];
    let chart;
    nv.addGraph(() => {
      chart = nv.models.multiBarHorizontalChart()
      .x( (d) => {
        return StringUtils.centerEllipses(d.label, this.LABEL_LENGTH);
      })
      .y(function (d) {
        return d.value;
      })
      .showValues(false)
      .duration(350)
      .showControls(true)
      .stacked(false)
      .showControls(false)
      .showLegend(false)
      .showYAxis(true)
      .groupSpacing(0.5)
      .margin({left: 90});

      chart.yAxis.tickFormat(d3.format('f'));

      d3.select(this.topUsers.nativeElement)
      .datum(topUsersData)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createAuthorisedAndUnAuthorisedChart() {
    const unAuthorised = [], authorised = [];
    const date = 11;
    Array.apply(null, {length: 10}).map(function(value, index){
      unAuthorised.push({x: '2018-03-' + (date + index), y: faker.random.number({min: 0, max: 10})});
      authorised.push({x: '2018-03-' + (date + index), y: faker.random.number({min: 0, max: 10})});
    });

    const test_data = [
      {'key': 'Authorised', 'nonStackable': false, 'values': authorised},
      {'key': 'UnAuthorised', 'nonStackable': false, 'values': unAuthorised}
    ];

    const that = this;
    nv.addGraph(() => {
      const chart = nv.models.multiBarChart()
      .stacked(true)
      .showControls(false)
      .color([chartColors.GREEN, chartColors.RED])
      .groupSpacing(.4);

      const svg = d3.select(this.authUnauthorisedAccess.nativeElement).datum(test_data);
      svg.transition().duration(0).call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private createSelectAndUpdate() {
    const data = [
      {'key': 'Select', 'y': faker.random.number({min: 0, max: 100})},
      {'key': 'Update', 'y': faker.random.number({min: 0, max: 100})}
    ];
    nv.addGraph(() => {
      const chart = nv.models.pieChart()
      .x(function (d) {
        return d.key;
      })
      .y(function (d) {
        return d.y;
      })
      .donut(true)
      .color(['#2DB075', '#2891C0'])
      .valueFormat((val) => `${val}%`)
      .labelType('percent');

      chart.pie.labelsOutside(true).donut(true);

      d3.select(this.selectAndUpdate.nativeElement)
      .datum(data)
      .transition().duration(1200)
      .call(chart);

      nv.utils.windowResize(chart.update);
      this.charts.push(chart);

      return chart;
    });
  }

  private updateChartDimensions() {
    this.charts.forEach(chart => {
      chart.update();
    });
    this.lineageComponent.reDraw();
  }
}
