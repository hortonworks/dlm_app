import {Component, Input} from '@angular/core';
import {Job} from '../../../models/job.model';

@Component({
  selector: 'job-transferred-graph',
  template: `
    <canvas baseChart [style.display]="'block'"
            width="100"
            height="30"
            [datasets]="graphData"
            [labels]="graphLabels"
            [colors]="graphColors"
            [legend]="false"
            [options]="graphOptions"
            [chartType]="'line'"></canvas>
    <ng-content></ng-content>
  `
})
export class JobTransferredGraphComponent {

  private colorStatusMap = {
    'WARNINGS': '#E98A40',
    'FAILED': '#EF6162'
  };

  @Input() job: Job;

  get graphLabels(): Array<any> {
    return this.job.graphData.map(() => '');
  };

  get graphColors(): Array<any> {
    const color = this.colorStatusMap[this.job.status];
    return [
      {
        backgroundColor: 'none',
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color
      }
    ];
  };

  get graphData(): Array<any> {
    return [
      {data: this.job.graphData, fill: false, label: ''}
    ];
  };

  graphOptions = {
    animation: false,
    elements: {
      point: {
        radius: 0
      }
    },
    tooltips: {
      enabled: false
    },
    responsive: false,
    scales: {
      xAxes: [{
        display: false,
        gridLines: {
          display: false
        }
      }],
      yAxes: [{
        display: false,
        gridLines: {
          display: false
        }
      }]
    }
  };

  constructor() {
  }

}
