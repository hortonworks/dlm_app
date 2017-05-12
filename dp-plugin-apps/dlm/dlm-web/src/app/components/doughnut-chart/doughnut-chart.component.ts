import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DoughnutChartData } from './doughnat-chart-data.type';

@Component({
  selector: 'dlm-doughnut-chart',
  template: `
    <canvas baseChart *ngIf="!isEmpty()"
      chartType="doughnut"
      [colors]="colors"
      [data]="chartData.data"
      [labels]="chartData.labels"
      [options]="options">
    </canvas>
    <canvas baseChart *ngIf="isEmpty()"
      chartType="doughnut"
      [colors]="emptyColors"
      [data]="emptyData"
      [labels]="emptyLabels"
      [options]="emptyOptions">
    </canvas>
  `,
  styleUrls: ['./doughnut-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoughnutChartComponent {
  emptyData = [1];
  emptyLabels = ['-'];
  @Input() options = {
    cutoutPercentage: 90,
    legend: {
      display: false
    }
  };
  emptyOptions = {
    ...this.options,
    tooltips: {
      enabled: false
    }
  };
  @Input() chartLabels = [];
  @Input() chartData: DoughnutChartData;
  @Input() colors = [
    {
      backgroundColor: ['#57b35f', '#fccf74', '#ef6162'],
      borderWidth: 0
    }
  ];

  emptyColors = [
    {
      ...this.colors[0],
      backgroundColor: ['#ccc']
    }
  ];

  isEmpty() {
    return this.chartData.data.every(value => !value);
  }
}