import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DoughnutChartData } from './doughnat-chart-data.type';

@Component({
  selector: 'dlm-doughnut-chart',
  template: `
    <canvas baseChart
      chartType="doughnut"
      [colors]="colors"
      [data]="chartData.data"
      [labels]="chartData.labels"
      [options]="options">
    </canvas>
  `,
  styleUrls: ['./doughnut-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoughnutChartComponent {
  @Input() options = {
    cutoutPercentage: 90,
    legend: {
      display: false
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
}
